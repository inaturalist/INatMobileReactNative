// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { BackButton, Heading2, KebabMenu } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useState
} from "react";
import { BackHandler } from "react-native";
import { Menu } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import DeleteObservationSheet from "./Sheets/DeleteObservationSheet";
import DiscardChangesSheet from "./Sheets/DiscardChangesSheet";
import DiscardObservationSheet from "./Sheets/DiscardObservationSheet";

type Props = {
  observations: Array<Object>,
  updateObservations: Function,
  currentObservation: Object
}

const Header = ( {
  observations,
  updateObservations,
  currentObservation
}: Props ): Node => {
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [deleteSheetVisible, setDeleteSheetVisible] = useState( false );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [discardObservationSheetVisible, setDiscardObservationSheetVisible] = useState( false );
  const [discardChangesSheetVisible, setDiscardChangesSheetVisible] = useState( false );

  const navToObsDetails = useCallback( ( ) => {
    navigation.navigate( "TabNavigator", {
      screen: "ObservationsStackNavigator",
      params: {
        screen: "ObsDetails",
        params: {
          uuid: currentObservation?.uuid
        }
      }
    } );
  }, [navigation, currentObservation] );

  const navToObsList = useCallback( ( ) => navigation.navigate( "TabNavigator", {
    screen: "ObservationsStackNavigator",
    params: {
      screen: "ObsList"
    }
  } ), [navigation] );

  const discardChanges = useCallback( ( ) => {
    setDiscardChangesSheetVisible( false );
    updateObservations( [] );
    navToObsDetails( );
  }, [updateObservations, navToObsDetails] );

  const discardObservation = useCallback( ( ) => {
    setDiscardObservationSheetVisible( false );
    updateObservations( [] );
    navToObsList( );
  }, [updateObservations, navToObsList] );

  const renderHeaderTitle = useCallback( ( ) => (
    <Heading2
      testID="new-observation-text"
      accessible
      accessibilityRole="header"
    >
      {observations.length <= 1
        ? t( "New-Observation" )
        : t( "X-Observations", { count: observations.length } )}
    </Heading2>
  ), [observations, t] );

  const handleBackButtonPress = useCallback( ( ) => {
    const unsyncedObservation = !currentObservation?._synced_at && currentObservation?._created_at;
    if ( params?.lastScreen === "GroupPhotos"
      || ( unsyncedObservation && !unsavedChanges )
    ) {
      navigation.goBack( );
    } else if ( !currentObservation?._created_at ) {
      setDiscardObservationSheetVisible( true );
    } else if ( unsavedChanges ) {
      setDiscardChangesSheetVisible( true );
    } else {
      navToObsDetails( );
    }
  }, [currentObservation, navigation, unsavedChanges, params, navToObsDetails] );

  const renderBackButton = useCallback( ( ) => {
    const extraPadding = {
      marginStart: 15,
      paddingVertical: 18,
      paddingEnd: 24
    };
    return (
      <BackButton
        onPress={handleBackButtonPress}
        customStyles={extraPadding}
        testID="ObsEdit.BackButton"
      />
    );
  }, [handleBackButtonPress] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  const renderKebabMenu = useCallback( ( ) => (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      large
    >
      <Menu.Item
        testID="Header.delete-observation"
        onPress={( ) => {
          setDeleteSheetVisible( true );
          setKebabMenuVisible( false );
        }}
        title={
          observations.length > 1
            ? t( "Delete-observations" )
            : t( "Delete-observation" )
        }
      />
    </KebabMenu>
  ), [kebabMenuVisible, observations, t, setDeleteSheetVisible] );

  return (
    <View className="flex-row justify-between items-center">
      {renderBackButton( )}
      {observations.length > 0 && renderHeaderTitle( )}
      <View className="mr-4">
        {observations.length > 0 && renderKebabMenu( )}
      </View>
      {deleteSheetVisible && (
        <DeleteObservationSheet
          handleClose={( ) => setDeleteSheetVisible( false )}
          navToObsList={navToObsList}
          observations={observations}
          currentObservation={currentObservation}
        />
      )}
      {discardObservationSheetVisible && (
        <DiscardObservationSheet
          discardObservation={discardObservation}
          handleClose={( ) => setDiscardObservationSheetVisible( false )}
          navToObsList={navToObsList}
          observations={observations}
        />
      )}
      {discardChangesSheetVisible && (
        <DiscardChangesSheet
          discardChanges={discardChanges}
          handleClose={( ) => setDiscardChangesSheetVisible( false )}
        />
      )}
    </View>
  );
};

export default Header;
