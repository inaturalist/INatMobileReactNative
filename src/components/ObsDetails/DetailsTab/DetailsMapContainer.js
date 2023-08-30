// @flow

import Clipboard from "@react-native-clipboard/clipboard";
import DetailsMap from "components/ObsDetails/DetailsTab/DetailsMap";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { t } from "i18next";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import openMap from "react-native-open-maps";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";

type Props = {
  observation: Object,
  latitude: number,
  longitude: number,
  closeModal: Function
}

const DetailsMapContainer = ( {
  observation, latitude, longitude, closeModal
}: Props ): Node => {
  const coordinateString = t( "Lat-Lon", {
    latitude: observation.latitude,
    longitude: observation.longitude
  } );

  const [showNotificationModal, setShowNotificationModal] = useState( false );
  const [mapTypeIndex, setMapTypeIndex] = useState( 0 );
  const mapTypes = ["standard", "satellite", "hybrid"];
  const displayCoordinates = t( "Lat-Lon-Acc", {
    latitude,
    longitude,
    accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
  } );
  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" )
  || checkCamelAndSnakeCase( observation, "privatePlaceGuess" );

  if ( !displayLocation ) {
    displayLocation = t( "No-Location" );
  }

  const closeShowNotificationModal = () => {
    setShowNotificationModal( false );
  };
  const copyCoordinates = () => {
    Clipboard.setString( coordinateString );
    setShowNotificationModal( true );
    // notification disappears after 2 secs
    setTimeout( closeModal, 2000 );
  };

  const cycleMapTypes = () => {
    if ( mapTypeIndex < 2 ) {
      setMapTypeIndex( mapTypeIndex + 1 );
    } else {
      setMapTypeIndex( 0 );
    }
  };

  const shareMap = () => {
    // takes in a provider prop but opens in browser instead of in app(google maps on iOS)
    openMap( { latitude, longitude } );
  };

  const mapViewRef = useRef<any>( null );

  const zoomToCurrentUserLocation = async () => {
    const userLocation = await fetchUserLocation( );
    if ( userLocation ) {
      mapViewRef.current.animateCamera( {
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      } );
    }
  };

  return (
    <DetailsMap
      mapViewRef={mapViewRef}
      latitude={latitude}
      longitude={longitude}
      privacy={observation?.geoprivacy}
      positionalAccuracy={observation.positional_accuracy}
      displayLocation={displayLocation}
      displayCoordinates={displayCoordinates}
      mapType={mapTypes[mapTypeIndex]}
      copyCoordinates={copyCoordinates}
      shareMap={shareMap}
      cycleMapTypes={cycleMapTypes}
      zoomToCurrentUserLocation={zoomToCurrentUserLocation}
      showNotificationModal={showNotificationModal}
      closeNotificationsModal={closeShowNotificationModal}
      closeModal={closeModal}
    />
  );
};

export default DetailsMapContainer;
