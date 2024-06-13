import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import fetchAvailableLocales from "api/translations";
import { updateUsers } from "api/users";
import {
  ActivityIndicator,
  Body2,
  Button,
  Heading4,
  PickerSheet,
  RadioButtonRow,
  ScrollViewWrapper
} from "components/SharedComponents";
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  View
} from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useTranslation,
  useUserMe
} from "sharedHooks";
import useStore from "stores/useStore";

const SETTINGS_URL = `${Config.OAUTH_API_URL}/users/edit?noh1=true`;
const FINISHED_WEB_SETTINGS = "finished-web-settings";

const Settings = ( ) => {
  const navigation = useNavigation( );
  const { t, i18n } = useTranslation();
  const currentUser = useCurrentUser( );
  const { remoteUser, isLoading, refetchUserMe } = useUserMe();
  const isAdvancedUser = useStore( state => state.isAdvancedUser );
  const setIsAdvancedUser = useStore( state => state.setIsAdvancedUser );

  const [settings, setSettings] = useState( {} );
  const [currentLocale, setCurrentLocale] = useState( i18n.language );
  const [isSaving, setIsSaving] = useState( false );
  const [availableLocales, setAvailableLocales] = useState( [] );
  const availableLocalesOptions = Object.fromEntries(
    availableLocales.map( locale => [locale.locale, {
      label: locale.language_in_locale,
      value: locale.locale
    }] )
  );
  const [localeSheetOpen, setLocaleSheetOpen] = useState( false );

  const queryClient = useQueryClient();

  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: () => {
        console.log( "[DEBUG Settings.js] updated user, refetching userMe" );
        queryClient.invalidateQueries( { queryKey: ["fetchUserMe"] } );
        refetchUserMe();
      },
      onError: () => {
        setIsSaving( false );
      }
    }
  );

  useEffect( () => {
    if ( remoteUser ) {
      setSettings( remoteUser );
      setCurrentLocale( remoteUser.locale );
      setIsSaving( false );
    }
  }, [remoteUser] );

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

  useEffect( () => {
    async function fetchLocales() {
      const savedLocale = await AsyncStorage.getItem( "currentLocale" );
      if ( savedLocale ) {
        setCurrentLocale( savedLocale );
      }

      // Whenever possible, save latest available locales from server
      const currentLocales = await AsyncStorage.getItem( "availableLocales" );

      setAvailableLocales( currentLocales
        ? JSON.parse( currentLocales )
        : [] );

      const locales = await fetchAvailableLocales();
      await AsyncStorage.setItem( "availableLocales", JSON.stringify( locales ) );
      setAvailableLocales( locales );
    }
    fetchLocales();
  }, [] );

  const changeTaxonNameDisplay = v => {
    setIsSaving( true );

    const payload = {
      id: settings?.id
    };

    if ( v === 1 ) {
      payload["user[prefers_common_names]"] = true;
      payload["user[prefers_scientific_name_first]"] = false;
    } else if ( v === 2 ) {
      payload["user[prefers_common_names]"] = true;
      payload["user[prefers_scientific_name_first]"] = true;
    } else if ( v === 3 ) {
      payload["user[prefers_common_names]"] = false;
      payload["user[prefers_scientific_name_first]"] = false;
    }

    updateUserMutation.mutate( payload );
  };

  const changeUserLocale = locale => {
    setIsSaving( true );

    const payload = {
      id: settings?.id
    };

    payload["user[locale]"] = locale;
    updateUserMutation.mutate( payload );
  };

  const renderLoggedOut = ( ) => (
    <>
      <Heading4>{t( "OBSERVATION-BUTTON" )}</Heading4>
      <Body2 className="mt-3">{t( "When-tapping-the-green-observation-button" )}</Body2>
      <View className="mt-5">
        <RadioButtonRow
          smallLabel
          checked={!isAdvancedUser}
          onPress={() => setIsAdvancedUser( false )}
          label={t( "iNaturalist-AI-Camera" )}
        />
      </View>
      <View className="mt-2 pr-5">
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
    <>
      <Heading4 className="mt-7">{t( "TAXON-NAMES-DISPLAY" )}</Heading4>
      <Body2 className="mt-3">{t( "This-is-how-taxon-names-will-be-displayed" )}</Body2>
      <View className="mt-5">
        <RadioButtonRow
          smallLabel
          checked={settings.prefers_common_names && !settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( 1 )}
          label={t( "Common-Name-Scientific-Name" )}
        />
      </View>
      <View className="mt-2">
        <RadioButtonRow
          smallLabel
          checked={settings.prefers_common_names && settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( 2 )}
          label={t( "Scientific-Name-Common-Name" )}
        />
      </View>
      <View className="mt-2">
        <RadioButtonRow
          smallLabel
          checked={!settings.prefers_common_names && !settings.prefers_scientific_name_first}
          onPress={() => changeTaxonNameDisplay( 3 )}
          label={t( "Scientific-Name" )}
        />
      </View>
      {availableLocales.length > 0 && (
        <>
          <Heading4 className="mt-7">{t( "APP-LANGUAGE" )}</Heading4>
          <Button
            className="mt-4"
            text={t( "CHANGE-APP-LANGUAGE" )}
            onPress={() => {
              setLocaleSheetOpen( true );
            }}
            accessibilityLabel={t( "CHANGE-APP-LANGUAGE" )}
          />
        </>
      )}
      {localeSheetOpen
        && (
          <PickerSheet
            headerText={t( "APP-LANGUAGE" )}
            confirm={newLocale => {
              setLocaleSheetOpen( false );
              // Remember the new locale locally
              AsyncStorage.setItem( "currentLocale", newLocale );
              i18n.changeLanguage( newLocale );

              // Also try and set the locale remotely
              changeUserLocale( newLocale );
            }}
            handleClose={() => setLocaleSheetOpen( false )}
            selectedValue={currentLocale || i18n.language}
            pickerValues={availableLocalesOptions}
          />
        )}
      <Heading4 className="mt-7">{t( "INATURALIST-ACCOUNT-SETTINGS" )}</Heading4>
      <Body2 className="mt-2">{t( "To-access-all-other-settings" )}</Body2>
      <Button
        className="mt-4"
        text={t( "INATURALIST-SETTINGS" )}
        onPress={() => {
          navigation.navigate( "FullPageWebView", {
            title: t( "Settings" ),
            loggedIn: true,
            initialUrl: SETTINGS_URL,
            openLinksInBrowser: true,
            blurEvent: FINISHED_WEB_SETTINGS
          } );
        }}
        accessibilityLabel={t( "INATURALIST-SETTINGS" )}
      />
    </>
  );

  return (
    <ScrollViewWrapper>
      <StatusBar barStyle="dark-content" />
      <View className="p-5">
        {renderLoggedOut( )}
        {currentUser && renderLoggedIn( )}
      </View>
      {( isSaving || isLoading ) && (
        <View className="absolute z-10 bg-lightGray/70
         w-full h-full flex items-center justify-center"
        >
          <ActivityIndicator size={50} />
        </View>
      )}
    </ScrollViewWrapper>
  );
};

export default Settings;
