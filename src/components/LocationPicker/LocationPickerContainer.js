// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect,
  useReducer, useRef
} from "react";
import { Dimensions, Platform } from "react-native";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";

import LocationPicker from "./LocationPicker";

const { width } = Dimensions.get( "screen" );

const DELTA = 0.02;
const CROSSHAIRLENGTH = 254;
export const DESIRED_LOCATION_ACCURACY = 100;
export const REQUIRED_LOCATION_ACCURACY = 500000;

const estimatedAccuracy = longitudeDelta => longitudeDelta * 1000 * (
  ( CROSSHAIRLENGTH / width ) * 100 );

const initialState = {
  accuracy: 0,
  accuracyTest: "pass",
  locationName: null,
  mapType: "standard",
  region: {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  },
  loading: true,
  hidePlaceResults: true
};

const reducer = ( state, action ) => {
  console.log( action.type, "action type" );
  switch ( action.type ) {
    case "ESTIMATE_ACCURACY":
      return {
        ...state,
        positional_accuracy: estimatedAccuracy( state.region.longitudeDelta )
      };
    case "FETCH_CURRENT_LOCATION":
      return {
        ...state,
        loading: false,
        region: {
          ...state.region,
          latitude: action.userLocation?.latitude,
          longitude: action.userLocation?.longitude
        }
      };
    case "INITIALIZE_MAP":
      return {
        ...state,
        accuracy: action.currentObservation?.positional_accuracy,
        locationName: action.currentObservation?.place_guess,
        region: {
          ...state.region,
          latitude: action.currentObservation?.latitude,
          longitude: action.currentObservation?.longitude,
          latitudeDelta: DELTA,
          longitudeDelta: DELTA
        }
      };
    case "RESET_LOCATION_PICKER":
      return {
        ...action.initialState
      };
    case "SELECT_PLACE_RESULT":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        hidePlaceResults: true
      };
    case "SET_ACCURACY_TEST":
      return {
        ...state,
        accuracyTest: action.accuracyTest
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading
      };
    case "SET_MAP_TYPE":
      return {
        ...state,
        mapType: action.mapType
      };
    case "UPDATE_LOCATION_NAME":
      return {
        ...state,
        locationName: action.locationName,
        hidePlaceResults: false
      };
    case "UPDATE_REGION":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        accuracy: action.accuracy
      };
    default:
      throw new Error( );
  }
};

type Props = {
  route: {
    params: {
      goBackOnSave: boolean
    },
  },
};

const LocationPickerContainer = ( { route }: Props ): Node => {
  const mapView = useRef( );
  const { currentObservation } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { goBackOnSave } = route.params;

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    accuracy,
    accuracyTest,
    loading,
    locationName,
    mapType,
    region,
    hidePlaceResults
  } = state;

  const showMap = region.latitude !== 0.0;

  const keysToUpdate = {
    latitude: region.latitude,
    longitude: region.longitude,
    positional_accuracy: accuracy,
    place_guess: locationName
  };

  useEffect( ( ) => {
    if ( accuracy < DESIRED_LOCATION_ACCURACY ) {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "pass" } );
    } else if ( accuracy < REQUIRED_LOCATION_ACCURACY ) {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "acceptable" } );
    } else {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "fail" } );
    }
  }, [accuracy] );

  const updateRegion = async newRegion => {
    const newAccuracy = estimatedAccuracy( newRegion.longitudeDelta );

    // don't update region if map hasn't actually moved
    // otherwise, it's jittery on Android
    if ( newRegion.latitude.toFixed( 6 ) === region.latitude?.toFixed( 6 )
      && newRegion.longitude.toFixed( 6 ) === region.longitude?.toFixed( 6 )
      && newRegion.latitudeDelta.toFixed( 6 ) === region.latitudeDelta?.toFixed( 6 ) ) {
      return;
    }

    const placeName = await fetchPlaceName( newRegion.latitude, newRegion.longitude );
    dispatch( {
      type: "UPDATE_REGION",
      locationName: placeName || null,
      region: newRegion,
      accuracy: newAccuracy
    } );
  };

  const toggleMapLayer = ( ) => {
    if ( mapType === "standard" ) {
      dispatch( { type: "SET_MAP_TYPE", mapType: "satellite" } );
    } else {
      dispatch( { type: "SET_MAP_TYPE", mapType: "standard" } );
    }
  };

  const returnToUserLocation = async ( ) => {
    dispatch( { type: "SET_LOADING", loading: false } );
    const userLocation = await fetchUserLocation( );
    dispatch( { type: "FETCH_CURRENT_LOCATION", userLocation } );
    mapView.current?.getCamera().then( cam => {
      if ( Platform.OS === "android" ) {
        cam.zoom = 20;
      } else {
        cam.altitude = 100;
      }
      mapView.current?.animateCamera( cam );
    } );
    dispatch( { type: "ESTIMATE_ACCURACY" } );
  };

  const updateLocationName = useCallback( name => {
    dispatch( { type: "UPDATE_LOCATION_NAME", locationName: name } );
  }, [] );

  // reset to initialState when exiting screen without saving
  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        if ( !currentObservation ) { return; }
        dispatch( { type: "INITIALIZE_MAP", currentObservation } );
      } );
      navigation.addListener( "blur", ( ) => {
        dispatch( { type: "RESET_LOCATION_PICKER", initialState } );
      } );
    },
    [navigation, currentObservation]
  );

  const setMapReady = ( ) => dispatch( { type: "SET_LOADING", loading: false } );

  const selectPlaceResult = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "SELECT_PLACE_RESULT",
      locationName: place.display_name,
      region: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0]
      }
    } );
  };

  return (
    <LocationPicker
      showMap={showMap}
      loading={loading}
      accuracyTest={accuracyTest}
      region={region}
      mapView={mapView}
      updateRegion={updateRegion}
      locationName={locationName}
      updateLocationName={updateLocationName}
      accuracy={accuracy}
      returnToUserLocation={returnToUserLocation}
      keysToUpdate={keysToUpdate}
      goBackOnSave={goBackOnSave}
      toggleMapLayer={toggleMapLayer}
      mapType={mapType}
      setMapReady={setMapReady}
      selectPlaceResult={selectPlaceResult}
      hidePlaceResults={hidePlaceResults}
    />
  );
};

export default LocationPickerContainer;
