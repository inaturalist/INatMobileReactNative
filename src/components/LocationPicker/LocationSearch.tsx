import { useQueryClient } from "@tanstack/react-query";
import fetchSearchResults from "api/search";
import {
  Body3,
  SearchBar
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useRef } from "react";
import { Keyboard, TextInput } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

interface Place {
  id: string;
  display_name: string;
  point_geojson: {
    coordinates: [number, number];
  };
}
interface Props {
  locationName: string;
  updateLocationName: ( _text: string ) => void;
  selectPlaceResult: ( _place: Place ) => void;
  hidePlaceResults: boolean;
}

const LocationSearch = ( {
  locationName = "", updateLocationName, selectPlaceResult, hidePlaceResults
}: Props ) => {
  const queryClient = useQueryClient( );
  const locationInput = useRef<TextInput>( );

  // this seems necessary for clearing the cache between searches
  queryClient.invalidateQueries( { queryKey: ["fetchSearchResults"] } );

  const {
    data: placeResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults( {
      q: locationName,
      sources: "places",
      fields: "place,place.display_name,place.point_geojson"
    }, optsWithAuth )
  );

  return (
    <>
      <SearchBar
        autoFocus={false}
        handleTextChange={locationText => {
          // only update location name when a user is typing,
          // not when a user selects a location from the dropdown
          if ( locationInput?.current?.isFocused( ) ) {
            updateLocationName( locationText );
          }
        }}
        value={locationName}
        testID="LocationPicker.locationSearch"
        containerClass="absolute top-[20px] right-[26px] left-[26px]"
        hasShadow
        input={locationInput}
      />
      <View
        className="absolute top-[65px] right-[26px] left-[26px] bg-white rounded-lg z-100"
        style={DROP_SHADOW}
      >
        {!hidePlaceResults && placeResults?.map( ( place: Place ) => (
          <Pressable
            accessibilityRole="button"
            key={place.id}
            className="p-2 border-[0.5px] border-lightGray"
            onPress={( ) => {
              selectPlaceResult( place );
              Keyboard.dismiss( );
            }}
          >
            <Body3>{place.display_name}</Body3>
          </Pressable>
        ) )}
      </View>
    </>
  );
};

export default LocationSearch;
