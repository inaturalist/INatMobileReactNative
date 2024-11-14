import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { updateUsers } from "api/users";
import {
  signOut
} from "components/LoginSignUp/AuthenticationService.ts";
import {
  ActivityIndicator,
  Body2,
  FullWidthButton,
  Heading4,
  RadioButtonRow,
  ScrollViewWrapper
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  View
} from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";
import QueueItem from "realmModels/QueueItem.ts";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useTranslation,
  useUserMe
} from "sharedHooks";
import useStore from "stores/useStore";

import LanguageSetting from "./LanguageSetting";

const { useRealm } = RealmContext;

const SETTINGS_URL = `${Config.OAUTH_API_URL}/users/edit?noh1=true`;
const FINISHED_WEB_SETTINGS = "finished-web-settings";

const NAME_DISPLAY_COM_SCI = "com-sci";
const NAME_DISPLAY_SCI_COM = "sci-com";
const NAME_DISPLAY_SCI = "sci";

const Settings = ( ) => {
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation( );
  const { t } = useTranslation();
  const currentUser = useCurrentUser( );
  const {
    remoteUser, isLoading, refetchUserMe
  } = useUserMe();
  const isAdvancedUser = useStore( state => state.isAdvancedUser );
  const setIsAdvancedUser = useStore( state => state.setIsAdvancedUser );
  const [settings, setSettings] = useState( {} );
  const [isSaving, setIsSaving] = useState( false );
  const [showingWebViewSettings, setShowingWebViewSettings] = useState( false );

  useFocusEffect(
    useCallback( () => {
      if ( showingWebViewSettings ) {
        // When we get back from the webview of settings - in case the user updated their profile
        // photo or other details
        refetchUserMe();
        setShowingWebViewSettings( false );
      }
    }, [showingWebViewSettings, refetchUserMe] )
  );

  const confirmInternetConnection = useCallback( ( ) => {
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return isConnected;
  }, [t, isConnected] );

  const queryClient = useQueryClient();

  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: () => {
        setIsSaving( false );
        queryClient.invalidateQueries( { queryKey: ["fetchUserMe"] } );
        refetchUserMe();
      },
      onError: () => {
        setIsSaving( false );
        confirmInternetConnection( );
      }
    }
  );

  useEffect( () => {
    if ( remoteUser ) {
      safeRealmWrite( realm, ( ) => {
        realm.create( "User", remoteUser, "modified" );
      }, "modifying current user via remote fetch in Settings" );
      setSettings( remoteUser );
      setIsSaving( false );
    }
  }, [remoteUser, realm] );

  // Listen for the webview to finish so we can fetch the updates users/me
  // response
  useEffect( ( ) => {
    const listener = EventRegister.addEventListener(
      FINISHED_WEB_SETTINGS,
      refetchUserMe
    );
    return ( ) => {
      EventRegister?.removeEventListener( listener );
    };
  }, [refetchUserMe] );

  const changeTaxonNameDisplay = useCallback( nameDisplayPref => {
    setIsSaving( true );

    const payload = {
      id: settings?.id
    };

    if ( nameDisplayPref === NAME_DISPLAY_COM_SCI ) {
      payload["user[prefers_common_names]"] = true;
      payload["user[prefers_scientific_name_first]"] = false;
    } else if ( nameDisplayPref === NAME_DISPLAY_SCI_COM ) {
      payload["user[prefers_common_names]"] = true;
      payload["user[prefers_scientific_name_first]"] = true;
    } else if ( nameDisplayPref === NAME_DISPLAY_SCI ) {
      payload["user[prefers_common_names]"] = false;
      payload["user[prefers_scientific_name_first]"] = false;
    }

    updateUserMutation.mutate( payload );
  }, [settings?.id, updateUserMutation] );

  const renderLoggedOut = ( ) => (
    <>
      <Heading4>{t( "OBSERVATION-BUTTON" )}</Heading4>
      <Body2 className="mt-3">{t( "When-tapping-the-green-observation-button" )}</Body2>
      <View className="mt-[22px] pr-5">
        <RadioButtonRow
          smallLabel
          checked={!isAdvancedUser}
          onPress={() => setIsAdvancedUser( false )}
          label={t( "iNaturalist-AI-Camera" )}
        />
      </View>
      <View className="mt-4 pr-5">
        <RadioButtonRow
          testID="all-observation-option"
          smallLabel
          checked={isAdvancedUser}
          onPress={() => setIsAdvancedUser( true )}
          label={t( "All-observation-option" )}
        />
      </View>
    </>
  );

  const renderLoggedIn = ( ) => (
    <View>
      {( isSaving || isLoading ) && (
        <View className="absolute z-10 bg-white/80
         w-full h-full flex items-center justify-center"
        >
          <ActivityIndicator size={50} />
        </View>
      )}
      <Heading4 className="mt-7">{t( "TAXON-NAMES-DISPLAY" )}</Heading4>
      <Body2 className="mt-3">{t( "This-is-how-taxon-names-will-be-displayed" )}</Body2>
      <View className="mt-[22px]">
        <RadioButtonRow
          smallLabel
          checked={settings.prefers_common_names && !settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_COM_SCI )}
          label={t( "Common-Name-Scientific-Name" )}
        />
      </View>
      <View className="mt-4">
        <RadioButtonRow
          smallLabel
          checked={settings.prefers_common_names && settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI_COM )}
          label={t( "Scientific-Name-Common-Name" )}
        />
      </View>
      <View className="mt-4">
        <RadioButtonRow
          smallLabel
          checked={!settings.prefers_common_names && !settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( NAME_DISPLAY_SCI )}
          label={t( "Scientific-Name" )}
        />
      </View>
      <LanguageSetting
        onChange={newLocale => {
          QueueItem.enqueue(
            realm,
            JSON.stringify( {
              id: settings?.id,
              "user[locale]": newLocale
            } ),
            "locale-change"
          );
        }}
      />
      <Heading4 className="mt-7">{t( "INATURALIST-ACCOUNT-SETTINGS" )}</Heading4>
      <Body2 className="mt-2">{t( "Edit-your-profile-change-your-settings" )}</Body2>
      <FullWidthButton
        className="mt-4 w-full"
        text={t( "ACCOUNT-SETTINGS" )}
        onPress={() => {
          confirmInternetConnection( );
          if ( !isConnected ) { return; }
          setShowingWebViewSettings( true );

          navigation.navigate( "FullPageWebView", {
            title: t( "ACCOUNT-SETTINGS" ),
            loggedIn: true,
            initialUrl: SETTINGS_URL,
            blurEvent: FINISHED_WEB_SETTINGS,
            clickablePathnames: ["/users/delete"],
            skipSetSourceInShouldStartLoadWithRequest: true,
            shouldLoadUrl: url => {
              async function signOutGoHome() {
                Alert.alert(
                  t( "Account-Deleted" ),
                  t( "It-may-take-up-to-an-hour-to-remove-content" )
                );
                // sign out
                await signOut( { realm, clearRealm: true, queryClient } );
                // navigate to My Obs
                navigation.navigate( "ObsList" );
              }
              // If the webview navigates to a URL that indicates the account
              // was deleted, sign the current user out of the app
              if ( url === `${Config.OAUTH_API_URL}/?account_deleted=true` ) {
                signOutGoHome( );
                return false;
              }
              return true;
            }
          } );
        }}
        accessibilityLabel={t( "INATURALIST-SETTINGS" )}
      />
    </View>
  );

  return (
    <ScrollViewWrapper>
      <StatusBar barStyle="dark-content" />
      <View className="p-5">
        {renderLoggedOut( )}
        {currentUser && renderLoggedIn( )}
      </View>
    </ScrollViewWrapper>
  );
};

export default Settings;
