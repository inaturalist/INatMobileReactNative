// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import { writeExifToFile } from "sharedHelpers/parseExif";
import uploadObservation from "sharedHelpers/uploadObservation";
import useTranslation from "sharedHooks/useTranslation";

import { log } from "../../../react-native-logs.config";
import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const { useRealm } = RealmContext;

const DESIRED_LOCATION_ACCURACY = 4000000;

type Props = {
  passesEvidenceTest: boolean,
  passesIdentificationTest: boolean
}

const BottomButtons = ( {
  passesEvidenceTest,
  passesIdentificationTest
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const {
    currentObservation,
    unsavedChanges,
    loading,
    currentObservationIndex,
    observations,
    cameraRollUris,
    setCurrentObservationIndex
  } = useContext( ObsEditContext );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState( null );

  const logger = log.extend( "ObsEditBottomButtons" );

  const ensureRealm = ( ) => {
    if ( !realm ) {
      throw new Error( "Gack, tried to save an observation without realm!" );
    }
  };

  const writeExifToCameraRollPhotos = async exif => {
    if ( !cameraRollUris || cameraRollUris.length === 0 || !currentObservation ) {
      return;
    }
    // Update all photos taken via the app with the new fetched location.
    cameraRollUris.forEach( uri => {
      logger.info( "writeExifToCameraRollPhotos, writing exif for uri: ", uri );
      writeExifToFile( uri, exif );
    } );
  };

  const saveObservation = async observation => {
    ensureRealm( );
    await writeExifToCameraRollPhotos( {
      latitude: observation.latitude,
      longitude: observation.longitude,
      positional_accuracy: observation.positionalAccuracy
    } );
    return Observation.saveLocalObservationForUpload( observation, realm );
  };

  const setNextScreen = async ( { type }: Object ) => {
    const savedObservation = await saveObservation( currentObservation );
    const params = {};
    if ( type === "upload" ) {
      // $FlowIgnore
      uploadObservation( savedObservation, realm );
      params.uuid = savedObservation.uuid;
    }

    if ( observations.length === 1 ) {
      // navigate to ObsList and start upload with uuid
      navigation.navigate( "TabNavigator", {
        screen: "ObservationsStackNavigator",
        params: {
          screen: "ObsList",
          params
        }
      } );
    } else if ( currentObservationIndex === observations.length - 1 ) {
      observations.pop( );
      setCurrentObservationIndex( currentObservationIndex - 1, observations );
    } else {
      observations.splice( currentObservationIndex, 1 );
      // this seems necessary for rerendering the ObsEdit screen
      setCurrentObservationIndex( currentObservationIndex, observations );
    }
  };

  useEffect(
    ( ) => {
      // reset button disabled status when scrolling through multiple observations
      if ( currentObservation ) {
        setButtonPressed( null );
      }
    },
    [currentObservation]
  );

  const showMissingEvidence = ( ) => {
    if ( allowUserToUpload ) { return false; }
    // missing evidence sheet takes precedence over the location imprecise sheet
    if ( !passesEvidenceTest ) {
      setShowMissingEvidenceSheet( true );
      setAllowUserToUpload( true );
      return true;
    }
    if ( currentObservation?.positional_accuracy
      && currentObservation?.positional_accuracy > DESIRED_LOCATION_ACCURACY ) {
      setShowImpreciseLocationSheet( true );
      return true;
    }
    return false;
  };

  const handlePress = type => {
    if ( showMissingEvidence( ) ) { return; }
    setButtonPressed( type );
    setNextScreen( { type } );
  };

  return (
    <StickyToolbar>
      {showMissingEvidenceSheet && (
        <MissingEvidenceSheet
          setShowMissingEvidenceSheet={setShowMissingEvidenceSheet}
        />
      )}
      {showImpreciseLocationSheet && (
        <ImpreciseLocationSheet
          setShowImpreciseLocationSheet={setShowImpreciseLocationSheet}
        />
      )}
      {currentObservation?._synced_at
        ? (
          <Button
            onPress={( ) => handlePress( "save" )}
            testID="ObsEdit.saveChangesButton"
            text={t( "SAVE-CHANGES" )}
            level={unsavedChanges
              ? "focus"
              : "neutral"}
            loading={buttonPressed === "save" && loading}
            disabled={buttonPressed !== null}
          />
        )
        : (
          <View className={classnames( "flex-row justify-evenly", {
            "opacity-50": !passesEvidenceTest
          } )}
          >
            <Button
              className="px-[25px]"
              onPress={( ) => handlePress( "save" )}
              testID="ObsEdit.saveButton"
              text={t( "SAVE" )}
              level="neutral"
              loading={buttonPressed === "save" && loading}
              disabled={buttonPressed !== null}
            />
            <Button
              className="ml-3 grow"
              level={passesEvidenceTest && passesIdentificationTest
                ? "focus"
                : "neutral"}
              text={t( "UPLOAD-NOW" )}
              testID="ObsEdit.uploadButton"
              onPress={( ) => handlePress( "upload" )}
              loading={buttonPressed === "upload" && loading}
              disabled={buttonPressed !== null}
            />
          </View>
        )}
    </StickyToolbar>
  );
};

export default BottomButtons;
