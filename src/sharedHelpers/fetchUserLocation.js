// @flow

import Geolocation from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import { Platform } from "react-native";
import { checkMultiple, RESULTS } from "react-native-permissions";

const options = {
  enableHighAccuracy: true,
  maximumAge: 0
};

const getCurrentPosition = ( ) => new Promise(
  ( resolve, error ) => {
    Geolocation.getCurrentPosition( resolve, error, options );
  }
);

type UserLocation = {
  latitude: number,
  longitude: number,
  positional_accuracy: number

}
const fetchUserLocation = async ( ): Promise<?UserLocation> => {
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );

  // TODO: handle case where iOS permissions are not granted
  if ( Platform.OS !== "android" && permissionResult !== RESULTS.GRANTED ) {
    return null;
  }

  try {
    const { coords } = await getCurrentPosition( );
    const userLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      positional_accuracy: coords.accuracy
    };
    return userLocation;
  } catch ( e ) {
    console.warn( e, "couldn't get latLng" );
  }
  return null;
};

export default fetchUserLocation;
