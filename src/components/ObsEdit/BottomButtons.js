// @flow

import classnames from "classnames";
import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import ImpreciseLocationSheet from "./Sheets/ImpreciseLocationSheet";
import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const DESIRED_LOCATION_ACCURACY = 4000000;

type Props = {
  passesEvidenceTest: boolean,
  passesIdentificationTest: boolean
}

const BottomButtons = ( {
  passesEvidenceTest,
  passesIdentificationTest
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    setNextScreen,
    currentObservation,
    unsavedChanges,
    loading
  } = useContext( ObsEditContext );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );
  const [showImpreciseLocationSheet, setShowImpreciseLocationSheet] = useState( false );
  const [allowUserToUpload, setAllowUserToUpload] = useState( false );
  const [buttonPressed, setButtonPressed] = useState( null );

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
