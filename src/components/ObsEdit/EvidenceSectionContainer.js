// @flow

import { DESIRED_LOCATION_ACCURACY } from "components/LocationPicker/LocationPicker";
import {
  differenceInCalendarYears,
  isFuture,
  parseISO
} from "date-fns";
import { difference } from "lodash";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef, useState
} from "react";
import {
  RESULTS as PERMISSION_RESULTS
} from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import useCurrentObservationLocation from "sharedHooks/useCurrentObservationLocation";
import useStore from "stores/useStore";

import EvidenceSection from "./EvidenceSection";

type Props = {
  passesEvidenceTest: boolean,
  setPassesEvidenceTest: Function,
  currentObservation: Object,
  updateObservationKeys: Function
}

const EvidenceSectionContainer = ( {
  setPassesEvidenceTest,
  passesEvidenceTest,
  currentObservation,
  updateObservationKeys
}: Props ): Node => {
  const photoEvidenceUris = useStore( state => state.photoEvidenceUris );
  const setPhotoEvidenceUris = useStore( state => state.setPhotoEvidenceUris );
  const photos = currentObservation?.observationPhotos?.map( obsPhoto => obsPhoto.photo ) || [];
  const mountedRef = useRef( true );
  const obsPhotoUris = photos.map(
    photo => photo.url || photo.localFilePath
  );

  const [showAddEvidenceSheet, setShowAddEvidenceSheet] = useState( false );

  const [
    shouldRetryCurrentObservationLocation,
    setShouldRetryCurrentObservationLocation
  ] = useState( false );

  // Hook version of componentWillUnmount. We use a ref to track mounted
  // state (not useState, which might get frozen in a closure for other
  // useEffects), and set it to false in the cleanup cleanup function. The
  // effect has an empty dependency array so it should only run when the
  // component mounts and when it unmounts, unlike in the cleanup effects of
  // other hooks, which will run when any of there dependency values change,
  // and maybe even before other hooks execute. If we ever need to do this
  // again we could probably wrap this into its own hook, like useMounted
  // ( ).
  useEffect( ( ) => {
    mountedRef.current = true;
    return function cleanup( ) {
      mountedRef.current = false;
    };
  }, [] );

  useEffect( ( ) => {
    if ( difference( obsPhotoUris, photoEvidenceUris ).length > 0 ) {
      setPhotoEvidenceUris( obsPhotoUris );
    }
  }, [photoEvidenceUris, setPhotoEvidenceUris, obsPhotoUris] );

  const {
    hasLocation,
    isFetchingLocation,
    permissionResult: locationPermissionResult
  } = useCurrentObservationLocation(
    mountedRef,
    currentObservation,
    updateObservationKeys,
    {
      retry: shouldRetryCurrentObservationLocation
    }
  );

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;

  useEffect( ( ) => {
    if ( latitude ) {
      setShouldRetryCurrentObservationLocation( false );
    } else if ( locationPermissionResult === "granted" ) {
      setShouldRetryCurrentObservationLocation( true );
    }
  }, [latitude, locationPermissionResult] );

  const hasPhotoOrSound = useMemo( ( ) => {
    if ( currentObservation?.observationPhotos?.length > 0
      || currentObservation?.observationSounds?.length > 0 ) {
      return true;
    }
    return false;
  }, [currentObservation] );

  const hasValidLocation = useMemo( ( ) => {
    if ( hasLocation
      && ( latitude !== 0 && longitude !== 0 )
      && ( latitude >= -90 && latitude <= 90 )
      && ( longitude >= -180 && longitude <= 180 )
      && ( currentObservation?.positional_accuracy === null
        || currentObservation?.positional_accuracy === undefined
        || (
          currentObservation?.positional_accuracy
        && currentObservation?.positional_accuracy <= DESIRED_LOCATION_ACCURACY )
      )
    ) {
      return true;
    }
    return false;
  }, [currentObservation, longitude, latitude, hasLocation] );

  const hasValidDate = useMemo( ( ) => {
    const observationDate = parseISO(
      currentObservation?.observed_on_string || currentObservation?.time_observed_at
    );
    if ( observationDate
      && !isFuture( observationDate )
      && differenceInCalendarYears( observationDate, new Date( ) ) <= 130
    ) {
      return true;
    }
    return false;
  }, [currentObservation] );

  const fullEvidenceTest = useCallback( ( ) => {
    if ( isFetchingLocation ) {
      return null;
    }
    if ( hasValidLocation && hasValidDate && hasPhotoOrSound ) {
      return true;
    }
    return false;
  }, [isFetchingLocation, hasValidLocation, hasValidDate, hasPhotoOrSound] );

  useEffect( ( ) => {
    // we're showing the Missing Evidence Sheet if location/date are missing
    // but not if there is a missing photo or sound
    // so the fullEvidenceTest which shows the red warning/green checkmark
    // is different than passesEvidenceTest
    if ( hasValidLocation && hasValidDate && !passesEvidenceTest ) {
      setPassesEvidenceTest( true );
    }
  }, [hasValidLocation, hasValidDate, setPassesEvidenceTest, passesEvidenceTest] );

  const locationTextClassNames = ( !latitude || !longitude ) && ["color-warningRed"];

  const handleDragAndDrop = ( { data } ) => {
    data.forEach( ( obsPhoto, index ) => {
      obsPhoto.position = index;
    } );

    updateObservationKeys( {
      observationPhotos: data
    } );
    const uris = data.map( obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath );
    setPhotoEvidenceUris( uris );
  };

  // Set the place_guess if not already set and coordinates are available.
  // Note that at present this sets the place_guess for *any* obs that lacks
  // it and has coords, including old obs, which might be a source of future
  // bugs, but is also kind of something we want. Something to keep an eye
  // on
  useEffect( ( ) => {
    async function setPlaceGuess( ) {
      const placeGuess = await fetchPlaceName( latitude, longitude );
      if ( placeGuess ) {
        updateObservationKeys( { place_guess: placeGuess } );
      }
    }
    if ( ( latitude && longitude ) && !currentObservation?.place_guess ) {
      setPlaceGuess( );
    }
  }, [
    currentObservation?.place_guess,
    latitude,
    longitude,
    updateObservationKeys
  ] );

  return (
    <EvidenceSection
      currentObservation={currentObservation}
      updateObservationKeys={updateObservationKeys}
      locationTextClassNames={locationTextClassNames}
      handleDragAndDrop={handleDragAndDrop}
      passesEvidenceTest={fullEvidenceTest}
      isFetchingLocation={isFetchingLocation}
      photos={photos || []}
      setShowAddEvidenceSheet={setShowAddEvidenceSheet}
      showAddEvidenceSheet={showAddEvidenceSheet}
      onLocationPermissionGranted={( ) => {
        setShouldRetryCurrentObservationLocation( true );
      }}
      onLocationPermissionDenied={( ) => {
        setShouldRetryCurrentObservationLocation( false );
      }}
      onLocationPermissionBlocked={( ) => {
        setShouldRetryCurrentObservationLocation( false );
      }}
      locationPermissionNeeded={locationPermissionResult === PERMISSION_RESULTS.DENIED}
    />
  );
};

export default EvidenceSectionContainer;
