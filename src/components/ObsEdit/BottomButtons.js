// @flow

import {
  Button, StickyToolbar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";

import MissingEvidenceSheet from "./Sheets/MissingEvidenceSheet";

const BottomButtons = ( ): Node => {
  const {
    saveObservation,
    saveAndUploadObservation,
    setNextScreen,
    setLoading
  } = useContext( ObsEditContext );
  const [showMissingEvidenceSheet, setShowMissingEvidenceSheet] = useState( false );

  return (
    <StickyToolbar containerClass="bottom-6">
      {showMissingEvidenceSheet && (
        <MissingEvidenceSheet
          setShowMissingEvidenceSheet={setShowMissingEvidenceSheet}
        />
      )}
      <View className="flex-row justify-evenly">
        <Button
          className="px-[25px]"
          onPress={async ( ) => {
            setLoading( true );
            await saveObservation( );
            setLoading( false );
            setNextScreen( );
          }}
          testID="ObsEdit.saveButton"
          text={t( "SAVE" )}
          level="neutral"
        />
        <Button
          className="ml-3 grow"
          level="focus"
          text={t( "UPLOAD-NOW" )}
          testID="ObsEdit.uploadButton"
          onPress={async ( ) => {
            setLoading( true );
            await saveAndUploadObservation( );
            setLoading( false );
            setNextScreen( );
          }}
        />
      </View>
    </StickyToolbar>
  );
};

export default BottomButtons;
