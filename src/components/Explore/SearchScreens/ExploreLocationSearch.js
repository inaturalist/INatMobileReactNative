// @flow

import fetchSearchResults from "api/search";
import {
  Body1,
  Button,
  List2,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import inatPlaceTypes from "dictionaries/places";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  hasPermissions?: boolean,
  renderPermissionsGate: Function,
  requestPermissions: Function,
  updateLocation: Function
};

const ExploreLocationSearch = ( {
  closeModal,
  hasPermissions,
  renderPermissionsGate,
  requestPermissions,
  updateLocation
}: Props ): Node => {
  const { t } = useTranslation( );
  const { dispatch, defaultExploreLocation } = useExplore( );

  const [locationName, setLocationName] = useState( "" );

  const resetPlace = useCallback(
    ( ) => {
      updateLocation( "worldwide" );
      closeModal();
    },
    [updateLocation, closeModal]
  );

  const { data: placeResults, isLoading, refetch } = useAuthenticatedQuery(
    ["fetchSearchResults", locationName],
    optsWithAuth => fetchSearchResults(
      {
        q: locationName,
        sources: "places",
        fields:
            "place,place.display_name,place.point_geojson,place.place_type",
        per_page: 50
      },
      optsWithAuth
    ),
    {
      enabled: locationName.length > 0
    }
  );

  const onPlaceSelected = useCallback( place => {
    updateLocation( place );
    closeModal();
  }, [updateLocation, closeModal] );

  const renderItem = useCallback(
    ( { item: place } ) => (
      <Pressable
        accessibilityRole="button"
        key={place.id}
        className="p-3 border-[0.5px] border-lightGray"
        onPress={() => onPlaceSelected( place )}
      >
        <Body1>{place.display_name}</Body1>
        {!!place.place_type && (
          <List2>{inatPlaceTypes[place.place_type]}</List2>
        )}
      </Pressable>
    ),
    [onPlaceSelected]
  );

  const data = placeResults || [];

  const setNearbyLocation = useCallback( ( ) => {
    async function getNearbyLocation( ) {
      const exploreLocation = await defaultExploreLocation( );
      // exploreLocation has a placeMode already
      // dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
      dispatch( { type: EXPLORE_ACTION.SET_EXPLORE_LOCATION, exploreLocation } );
      closeModal();
    }
    getNearbyLocation( );
  }, [dispatch, defaultExploreLocation, closeModal] );

  const onNearbyPressed = () => {
    if ( hasPermissions ) {
      setNearbyLocation( );
    } else {
      requestPermissions( );
    }
  };

  const renderEmptyList = ( ) => (
    <EmptySearchResults
      isLoading={isLoading}
      searchQuery={locationName}
      refetch={refetch}
    />
  );

  const renderFooter = ( ) => <View className="h-[336px]" />;

  return (
    <ViewWrapper testID="explore-location-search">
      <ExploreSearchHeader
        closeModal={closeModal}
        headerText={t( "SEARCH-LOCATION" )}
        resetFilters={resetPlace}
        testID="ExploreLocationSearch.close"
      />
      <View
        className="bg-white pt-2 pb-4"
        style={DROP_SHADOW}
      >
        <View className="px-6">
          <SearchBar
            handleTextChange={locationText => setLocationName( locationText )}
            value={locationName}
            testID="ExploreLocationSearch.locationSearch"
          />
        </View>
        <View className="flex-row px-6 mt-5 justify-around">
          <Button
            className="w-1/2"
            onPress={onNearbyPressed}
            text={t( "NEARBY" )}
          />
          <View className="px-5" />
          <Button
            className="w-1/2"
            onPress={resetPlace}
            text={t( "WORLDWIDE" )}
          />
        </View>
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
      />
      {renderPermissionsGate( { onPermissionGranted: setNearbyLocation } )}
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
