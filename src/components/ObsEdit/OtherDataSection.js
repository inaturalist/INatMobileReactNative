// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useContext } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import colors from "styles/colors";
import { pickerSelectStyles, viewStyles } from "styles/obsEdit/obsEdit";

import { ObsEditContext } from "../../providers/contexts";
import Notes from "./Notes";

const OtherDataSection = ( ): Node => {
  const {
    currentObsIndex,
    observations,
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
    label: t( "No" ),
    value: true
  },
  {
    label: t( "Yes" ),
    value: false
  }];

  const currentObs = observations[currentObsIndex];

  const addNotes = text => updateObservationKey( "description", text );
  const updateGeoprivacyStatus = value => updateObservationKey( "geoprivacy", value );
  const updateCaptiveStatus = value => updateObservationKey( "captive_flag", value );

  const currentGeoprivacyStatus = geoprivacyOptions.find( e => e.value === currentObs.geoprivacy );
  const currentCaptiveStatus = captiveOptions.find( e => e.value === currentObs.captive_flag );

  return (
    <>
      <View style={viewStyles.row}>
        <RNPickerSelect
          onValueChange={updateGeoprivacyStatus}
          items={geoprivacyOptions}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={currentObs.geoprivacy}
        >
          <Button
            icon="earth"
            mode="text"
            onPress={() => console.log( "Pressed" )}
            textColor={colors.black}
          >
            {t( "Geoprivacy" )}
            {" "}
            {currentGeoprivacyStatus?.label}
          </Button>
        </RNPickerSelect>
      </View>
      <View style={viewStyles.row}>
        <RNPickerSelect
          onValueChange={updateCaptiveStatus}
          items={captiveOptions}
          useNativeAndroidPickerStyle={false}
          style={pickerSelectStyles}
          value={currentObs.captive_flag}
        >
          <Button
            icon="pot"
            mode="text"
            onPress={() => console.log( "Pressed" )}
            textColor={colors.black}
          >
            {t( "Organism-is-wild" )}
            {" "}
            {currentCaptiveStatus?.label}
          </Button>
        </RNPickerSelect>
      </View>
      <Notes addNotes={addNotes} description={currentObs.description} />
    </>
  );
};

export default OtherDataSection;
