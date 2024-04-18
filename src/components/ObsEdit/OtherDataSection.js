// @flow

import {
  Heading4, TextInputSheet
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

import DropdownItem from "./DropdownItem";
import GeoprivacySheet from "./Sheets/GeoprivacySheet";
import WildStatusSheet from "./Sheets/WildStatusSheet";

type Props = {
  currentObservation: any,
  updateObservationKeys: any
}

const OtherDataSection = ( {
  currentObservation,
  updateObservationKeys
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showGeoprivacySheet, setShowGeoprivacySheet] = useState( false );
  const [showWildStatusSheet, setShowWildStatusSheet] = useState( false );
  const [showNotesSheet, setShowNotesSheet] = useState( false );

  const geoprivacyOptions = [{
    label: t( "Open" ),
    value: "open"
  },
  {
    label: t( "Obscured" ),
    value: "obscured"
  },
  {
    label: t( "Private" ),
    value: "private"
  }];

  // opposite of Seek (asking if wild, not if captive)
  const captiveOptions = [
    {
      label: t( "Organism-is-wild" ),
      value: false
    },
    {
      label: t( "Organism-is-captive" ),
      value: true
    }];

  const currentGeoprivacyStatus = geoprivacyOptions
    .find( e => e.value === currentObservation?.geoprivacy );
  const currentCaptiveStatus = captiveOptions
    .find( e => e.value === currentObservation?.captive_flag );

  return (
    <View className="mx-5 mt-6">
      {showGeoprivacySheet && (
        <GeoprivacySheet
          selectedValue={currentObservation?.geoprivacy}
          handleClose={( ) => setShowGeoprivacySheet( false )}
          updateGeoprivacyStatus={value => updateObservationKeys( {
            geoprivacy: value
          } )}
        />
      )}
      {showWildStatusSheet && (
        <WildStatusSheet
          selectedValue={currentObservation?.captive_flag}
          handleClose={( ) => setShowWildStatusSheet( false )}
          updateCaptiveStatus={value => updateObservationKeys( {
            captive_flag: value
          } )}
        />
      )}
      {showNotesSheet && (
        <TextInputSheet
          handleClose={( ) => setShowNotesSheet( false )}
          headerText={t( "NOTES" )}
          placeholder={t( "Add-optional-notes" )}
          initialInput={currentObservation?.description}
          confirm={textInput => updateObservationKeys( {
            description: textInput
          } )}
        />
      )}
      <Heading4>{t( "OTHER-DATA" )}</Heading4>
      <DropdownItem
        accessibilityLabel={t( "Select-geoprivacy-status" )}
        handlePress={( ) => setShowGeoprivacySheet( true )}
        iconName="globe-outline"
        text={t( "Geoprivacy-status", {
          status: currentGeoprivacyStatus?.label || geoprivacyOptions[0].label
        } )}
      />
      <DropdownItem
        accessibilityLabel={t( "Select-captive-or-cultivated-status" )}
        handlePress={( ) => setShowWildStatusSheet( true )}
        iconName="pot-outline"
        text={currentCaptiveStatus?.label || captiveOptions[0].label}
      />
      <DropdownItem
        accessibilityLabel={t( "Add-optional-notes" )}
        handlePress={( ) => setShowNotesSheet( true )}
        iconName="pencil-outline"
        text={currentObservation?.description || t( "Add-optional-notes" )}
      />
    </View>
  );
};

export default OtherDataSection;
