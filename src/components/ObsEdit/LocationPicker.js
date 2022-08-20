// @flow

import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import useLocationName from "../../sharedHooks/useLocationName";
import { viewStyles } from "../../styles/obsEdit/locationPicker";
import Button from "../SharedComponents/Buttons/Button";
import InputField from "../SharedComponents/InputField";
import Map from "../SharedComponents/Map";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useCoords from "./hooks/useCoords";

type Props = {
  closeLocationPicker: Function,
  updateLocation: Function
}

const LocationPicker = ( { closeLocationPicker, updateLocation }: Props ): Node => {
  const [searchQuery, setSearchQuery] = useState( "" );
  const [region, setRegion] = useState( {
    latitude: null,
    longitude: null
  } );

  const locationName = useLocationName( region.latitude, region.longitude );
  const newCoords = useCoords( searchQuery );

  const updateLocationAndClose = ( ) => {
    updateLocation( {
      latitude: region.latitude,
      longitude: region.longitude,
      placeGuess: locationName
    } );
    closeLocationPicker( );
  };

  useEffect( ( ) => {
    // update region when user types search term
    if ( !searchQuery ) { return; }
    if ( newCoords.latitude !== null && newCoords.latitude !== region.latitude ) {
      setRegion( newCoords );
    }
  }, [newCoords, region, searchQuery] );

  const updateCoords = newMapRegion => {
    setSearchQuery( "" );
    setRegion( newMapRegion );
  };

  return (
    <ViewNoFooter>
      <InputField
        handleTextChange={setSearchQuery}
        placeholder={locationName || ""}
        text={searchQuery}
        type="addressCity"
        testID="LocationPicker.search"
      />
      <Map
        updateCoords={updateCoords}
        region={region}
        mapHeight={600}
      />
      <View style={viewStyles.confirmButtonFooter}>
        <Button
          level="primary"
          text="confirm location"
          handlePress={updateLocationAndClose}
          testID="LocationPicker.confirmButton"
        />
      </View>
    </ViewNoFooter>
  );
};

export default LocationPicker;
