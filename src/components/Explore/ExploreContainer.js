// @flow

import { useRoute } from "@react-navigation/native";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactNavigationPerformanceView } from "@shopify/react-native-performance-navigation";
import type { Node } from "react";
import React, { useEffect, useReducer } from "react";

import Explore from "./Explore";

const DELTA = 0.2;

const initialState = {
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
    place_guess: ""
  },
  exploreParams: {
    taxon_id: 1,
    lat: 0.0,
    lng: 0.0,
    radius: 50,
    taxon_name: "Animals",
    return_bounds: true
  },
  exploreView: "observations"
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_LOCATION":
      return {
        ...state,
        region: action.region,
        exploreParams: {
          ...state.exploreParams,
          lat: action.region.latitude,
          lng: action.region.longitude,
          radius: 50
        }
      };
    case "CHANGE_EXPLORE_VIEW":
      return {
        ...state,
        exploreView: action.exploreView
      };
    case "CHANGE_TAXON":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          taxon_id: action.taxonId,
          taxon_name: action.taxonName
        }
      };
    case "CHANGE_PLACE_ID":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          lat: null,
          lng: null,
          radius: null,
          place_id: action.placeId
        },
        region: action.region
      };
    case "SET_PLACE_NAME":
      return {
        ...state,
        region: {
          ...state.region,
          place_guess: action.placeName
        }
      };
    case "SET_TAXON_NAME":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          taxon_name: action.taxonName
        }
      };
    case "SET_EXPLORE_FILTERS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          ...action.exploreFilters
        }
      };
    default:
      throw new Error( );
  }
};

const ExploreContainer = ( ): Node => {
  const { params } = useRoute( );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    region,
    exploreParams,
    exploreView
  } = state;

  useEffect( ( ) => {
    if ( params?.projectId ) {
      dispatch( {
        type: "SET_EXPLORE_FILTERS",
        exploreFilters: {
          project_id: params?.projectId,
          place_id: params?.placeId || "any",
          lat: null,
          lng: null,
          radius: null
        }
      } );
    }
  }, [params] );

  const changeExploreView = newView => {
    dispatch( {
      type: "CHANGE_EXPLORE_VIEW",
      exploreView: newView
    } );
  };

  const updateTaxon = taxon => {
    dispatch( {
      type: "CHANGE_TAXON",
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updatePlace = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "CHANGE_PLACE_ID",
      placeId: place?.id,
      region: {
        ...state.region,
        latitude: coordinates[1],
        longitude: coordinates[0],
        place_guess: place?.display_name
      }
    } );
  };

  const updatePlaceName = newPlaceName => {
    dispatch( {
      type: "SET_PLACE_NAME",
      placeName: newPlaceName
    } );
  };

  const updateTaxonName = newTaxonName => {
    dispatch( {
      type: "SET_TAXON_NAME",
      taxonName: newTaxonName
    } );
  };

  return (
    <ReactNavigationPerformanceView interactive={!!state} screenName="Explore">
      <Explore
        exploreParams={exploreParams}
        region={region}
        exploreView={exploreView}
        changeExploreView={changeExploreView}
        updateTaxon={updateTaxon}
        updatePlace={updatePlace}
        updatePlaceName={updatePlaceName}
        updateTaxonName={updateTaxonName}
      />
    </ReactNavigationPerformanceView>
  );
};

export default ExploreContainer;
