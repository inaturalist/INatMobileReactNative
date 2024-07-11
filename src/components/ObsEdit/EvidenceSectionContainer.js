// @flow

import { DESIRED_LOCATION_ACCURACY } from "components/LocationPicker/LocationPicker";
import {
  differenceInCalendarYears,
  isFuture,
  parseISO
} from "date-fns";
import { isNil } from "lodash";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import useWatchPosition from "sharedHooks/useWatchPosition.ts";
import useStore from "stores/useStore";

import EvidenceSection from "./EvidenceSection";

type Props = {
  passesEvidenceTest: boolean,
  locationPermissionNeeded: boolean,
  setPassesEvidenceTest: Function,
  shouldFetchLocation: boolean,
  currentObservation: Object,
  updateObservationKeys: Function
}

const EvidenceSectionContainer = ( {
  setPassesEvidenceTest,
  locationPermissionNeeded,
  passesEvidenceTest,
  shouldFetchLocation,
  currentObservation,
  updateObservationKeys
}: Props ): Node => {
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const isNewObs = !!currentObservation?._synced_at
    || ( currentObservation && !( "_synced_at" in currentObservation ) );
  const hasPhotos = currentObservation?.observationPhotos?.length > 0;
  const hasImportedPhotos = hasPhotos && cameraRollUris.length === 0;
  const observationPhotos = currentObservation?.observationPhotos || [];
  const observationSounds = currentObservation?.observationSounds || [];

  const [showAddEvidenceSheet, setShowAddEvidenceSheet] = useState( false );
  const [currentPlaceGuess, setCurrentPlaceGuess] = useState( );

  const [
    shouldRetryCurrentObservationLocation,
    setShouldRetryCurrentObservationLocation
  ] = useState( false );

  const {
    isFetchingLocation,
    userLocation
  } = useWatchPosition( {
    retry: shouldRetryCurrentObservationLocation,
    shouldFetchLocation
  } );

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;

  const hasPhotoOrSound = useMemo( ( ) => {
    if ( currentObservation?.observationPhotos?.length > 0
      || currentObservation?.observationSounds?.length > 0 ) {
      return true;
    }
    return false;
  }, [currentObservation] );

  const hasValidLocation = useMemo( ( ) => {
    const coordinatesExist = latitude !== 0 && longitude !== 0;
    const latitudeInRange = latitude >= -90 && latitude <= 90;
    const longitudeInRange = longitude >= -180 && longitude <= 180;
    const positionalAccuracyBlank = isNil( currentObservation?.positional_accuracy );
    const positionalAccuracyDesireable = (
      currentObservation?.positional_accuracy || 0
    ) <= DESIRED_LOCATION_ACCURACY;
    let validPositionalAccuracy = ( positionalAccuracyBlank || positionalAccuracyDesireable );

    if ( isNewObs && hasImportedPhotos ) {
      // Don't check for valid positional accuracy in case of a new observation with imported photos
      validPositionalAccuracy = true;
    }

    if ( coordinatesExist
      && latitudeInRange
      && longitudeInRange
      && validPositionalAccuracy
    ) {
      return true;
    }
    return false;
  }, [
    currentObservation,
    longitude,
    latitude,
    isNewObs,
    hasImportedPhotos
  ] );

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
  }, [
    hasValidDate,
    hasValidLocation,
    passesEvidenceTest,
    setPassesEvidenceTest
  ] );

  const locationTextClassNames = ( !latitude || !longitude )
    ? ["color-warningRed"]
    : [];

  useEffect( () => {
    if ( !currentPlaceGuess ) return;

    updateObservationKeys( { place_guess: currentPlaceGuess } );
  }, [currentPlaceGuess, updateObservationKeys] );

  // Set the place_guess if not already set and coordinates are available.
  // Note that at present this sets the place_guess for *any* obs that lacks
  // it and has coords, including old obs, which might be a source of future
  // bugs, but is also kind of something we want. Something to keep an eye
  // on
  useEffect( ( ) => {
    async function setPlaceGuess( ) {
      const placeGuess = await fetchPlaceName( latitude, longitude );
      if ( placeGuess ) {
        // Cannot call updateObservationKeys directly from here, since fetchPlaceName might take
        // a while to return, in the meantime the current copy of the observation might have
        // changed, so we update the observation from useEffect of currentPlaceGuess, so it will
        // always have the latest copy of the current observation (see GH issue #584)
        setCurrentPlaceGuess( placeGuess );
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

  useEffect( ( ) => {
    if ( userLocation ) {
      updateObservationKeys( userLocation );
    }
  }, [userLocation, updateObservationKeys] );

  return (
    <EvidenceSection
      currentObservation={currentObservation}
      updateObservationKeys={updateObservationKeys}
      locationTextClassNames={locationTextClassNames}
      passesEvidenceTest={fullEvidenceTest}
      isFetchingLocation={isFetchingLocation}
      observationPhotos={observationPhotos}
      setShowAddEvidenceSheet={setShowAddEvidenceSheet}
      showAddEvidenceSheet={showAddEvidenceSheet}
      observationSounds={observationSounds}
      onLocationPermissionGranted={( ) => {
        setShouldRetryCurrentObservationLocation( true );
      }}
      onLocationPermissionDenied={( ) => {
        setShouldRetryCurrentObservationLocation( false );
      }}
      onLocationPermissionBlocked={( ) => {
        setShouldRetryCurrentObservationLocation( false );
      }}
      locationPermissionNeeded={locationPermissionNeeded}
    />
  );
};

export default EvidenceSectionContainer;
