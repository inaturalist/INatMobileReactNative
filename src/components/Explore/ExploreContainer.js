// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useReducer } from "react";
import { useIsConnected } from "sharedHooks";

import Explore from "./Explore";

const { useRealm } = RealmContext;

const DELTA = 0.2;

const calculatedFilters = {
  user: undefined,
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  sortBy: "DATE_UPLOADED_NEWEST",
  user_id: undefined,
};

const initialState: {
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
    place_guess: string,
  },
  exploreParams: {
    verifiable: boolean,
    return_bounds: boolean,
    taxon?: Object,
    taxon_id?: number,
    taxon_name?: string,
    place_id?: number,
    lat?: number,
    lng?: number,
    radius?: number,
    project_id?: number,
    sortBy: string,
    user: ?Object,
    user_id: ?string,
  },
  exploreView: string,
  showFiltersModal: boolean,
} = {
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA,
    place_guess: ""
  },
  exploreParams: {
    verifiable: true,
    return_bounds: true,
    taxon: undefined,
    taxon_id: undefined,
    taxon_name: undefined,
    place_id: undefined,
    lat: undefined,
    lng: undefined,
    radius: undefined,
    project_id: undefined,
    ...defaultFilters
  },
  exploreView: "observations",
  showFiltersModal: false
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
          taxon: action.taxon,
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
        region: {
          ...state.region,
          latitude: action.latitude,
          longitude: action.longitude,
          place_guess: action.place_guess
        }
      };
    case "CHANGE_SORT_BY":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          sortBy: action.sortBy
        }
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
    case "SET_USER":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          user: action.user,
          user_id: action.userId
        }
      };
    case "RESET_EXPLORE_FILTERS":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          ...defaultFilters
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
    case "SHOW_FILTERS_MODAL":
      return {
        ...state,
        showFiltersModal: true
      };
    case "CLOSE_FILTERS_MODAL":
      return {
        ...state,
        showFiltersModal: false
      };
    default:
      throw new Error( );
  }
};

const ExploreContainer = ( ): Node => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const realm = useRealm();
  const navigation = useNavigation();

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    region,
    exploreParams,
    exploreView,
    showFiltersModal
  } = state;

  useEffect( ( ) => {
    if ( params?.taxon ) {
      dispatch( {
        type: "CHANGE_TAXON",
        taxon: params?.taxon,
        taxonId: params?.taxon.id,
        taxonName: params?.taxon.preferred_common_name || params?.taxon.name
      } );
    }
    if ( params?.place ) {
      const { coordinates } = params.place.point_geojson;
      dispatch( {
        type: "CHANGE_PLACE_ID",
        placeId: params.place?.id,
        latitude: coordinates[1],
        longitude: coordinates[0],
        place_guess: params.place?.display_name
      } );
    }
    if ( params?.user ) {
      dispatch( {
        type: "SET_USER",
        user: params.user,
        userId: params.user.id
      } );
    }
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

  const filtersNotDefault = () => Object.keys( defaultFilters ).some(
    key => defaultFilters[key] !== exploreParams[key]
  );

  const numberOfFilters = Object.keys( calculatedFilters ).reduce( ( count, key ) => {
    if ( exploreParams[key] && exploreParams[key] !== calculatedFilters[key] ) {
      return count + 1;
    }
    return count;
  }, 0 );

  const changeExploreView = newView => {
    dispatch( {
      type: "CHANGE_EXPLORE_VIEW",
      exploreView: newView
    } );
  };

  const updateTaxon = ( taxonName: string ) => {
    const selectedTaxon = realm
      ?.objects( "Taxon" )
      .filtered( "name CONTAINS[c] $0", taxonName );
    const taxon = selectedTaxon.length > 0
      ? selectedTaxon[0]
      : null;
    dispatch( {
      type: "CHANGE_TAXON",
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updatePlace = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "CHANGE_PLACE_ID",
      placeId: place?.id,
      latitude: coordinates[1],
      longitude: coordinates[0],
      place_guess: place?.display_name
    } );
  };

  const updateSortBy = sortBy => {
    dispatch( {
      type: "CHANGE_SORT_BY",
      sortBy
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

  const filteredParams = Object.entries( exploreParams ).reduce(
    ( newParams, [key, value] ) => {
      if ( value ) {
        newParams[key] = value;
      }
      return newParams;
    },
    {}
  );

  return (
    <Explore
      exploreParams={filteredParams}
      region={region}
      exploreView={exploreView}
      changeExploreView={changeExploreView}
      updateTaxon={updateTaxon}
      updatePlace={updatePlace}
      updatePlaceName={updatePlaceName}
      updateTaxonName={updateTaxonName}
      filtersNotDefault={filtersNotDefault()}
      resetFilters={() => dispatch( { type: "RESET_EXPLORE_FILTERS" } )}
      updateSortBy={updateSortBy}
      isOnline={isOnline}
      showFiltersModal={showFiltersModal}
      // openFiltersModal={() => dispatch( { type: "SHOW_FILTERS_MODAL" } )}
      openFiltersModal={() => navigation.navigate( "ExploreFilterScreen" )}
      closeFiltersModal={() => dispatch( { type: "CLOSE_FILTERS_MODAL" } )}
      numberOfFilters={numberOfFilters}
    />
  );
};

export default ExploreContainer;
