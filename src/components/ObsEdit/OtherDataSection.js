// @flow

import { Body3, Heading4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import RNPickerSelect from "react-native-picker-select";

import NotesSheet from "./NotesSheet";

const OtherDataSection = ( ): Node => {
  const [showNotesSheet, setShowNotesSheet] = useState( false );

  const {
    currentObservation,
    updateObservationKey
  } = useContext( ObsEditContext );

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
  const captiveOptions = [{
    label: t( "Organism-is-captive" ),
    value: true
  },
  {
    label: t( "Organism-is-wild" ),
    value: false
  }];

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );

  const currentGeoprivacyStatus = geoprivacyOptions
    .find( e => e.value === currentObservation.geoprivacy );
  const currentCaptiveStatus = captiveOptions
    .find( e => e.value === currentObservation.captive_flag );

  return (
    <View className="ml-5 mt-6">
      <Heading4>{t( "OTHER-DATA" )}</Heading4>
      <RNPickerSelect
        onValueChange={updateGeoprivacyStatus}
        items={geoprivacyOptions}
        useNativeAndroidPickerStyle={false}
        value={currentObservation.geoprivacy}
      >
        <View className="flex-row flex-nowrap items-center ml-1 mt-5">
          <INatIcon
            name="globe-outline"
            size={14}
          />
          <Body3 className="ml-5">
            {t( "Geoprivacy" )}
            {" "}
            {currentGeoprivacyStatus?.label}
          </Body3>
        </View>
      </RNPickerSelect>
      <RNPickerSelect
        onValueChange={updateCaptiveStatus}
        items={captiveOptions}
        useNativeAndroidPickerStyle={false}
        value={currentObservation.captive_flag}
      >
        <View className="flex-row flex-nowrap items-center ml-1 mt-5">
          <INatIcon
            name="pot-outline"
            size={14}
          />
          <Body3 className="ml-5">
            {currentCaptiveStatus?.label}
          </Body3>
        </View>
      </RNPickerSelect>
      <View className="flex-row flex-nowrap items-center ml-1 mt-2.5">
        {showNotesSheet && (
          <NotesSheet
            setShowNotesSheet={setShowNotesSheet}
            addNotes={addNotes}
            description={currentObservation?.description}
          />
        )}
        <INatIcon
          size={14}
          name="pencil-outline"
        />
        <Body3
          onPress={( ) => setShowNotesSheet( true )}
          className="pl-5 py-3"
        >
          {currentObservation?.description || t( "Add-optional-notes" )}
        </Body3>
      </View>
    </View>
  );
};

export default OtherDataSection;
