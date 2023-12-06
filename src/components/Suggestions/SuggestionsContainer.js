// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import scoreImage from "api/computerVision";
import { difference } from "lodash";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect, useState
} from "react";
import Identification from "realmModels/Identification";
import { predictImage } from "sharedHelpers/cvModel";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery,
  useLocalObservation
} from "sharedHooks";
import useStore from "stores/useStore";

import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const comment = useStore( state => state.comment );
  const currentObservation = useStore( state => state.currentObservation );
  const photoEvidenceUris = useStore( state => state.photoEvidenceUris );
  const setPhotoEvidenceUris = useStore( state => state.setPhotoEvidenceUris );
  const { params } = useRoute( );
  const obsUUID = params?.obsUUID;
  const uuid = currentObservation?.uuid;
  // TODO unify around a single interface for an Observation
  const obsPhotos = currentObservation?.observationPhotos || currentObservation?.observation_photos;
  const obsPhotoUris = ( obsPhotos || [] ).map(
    obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath
  );
  const localObservation = useLocalObservation( uuid );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoEvidenceUris[0] );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const updateObservations = useStore( state => state.updateObservations );

  const [loading, setLoading] = useState( false );
  const navigation = useNavigation();

  const updateObservationKeys = useCallback( keysAndValues => {
    const updatedObservations = observations;
    const updatedObservation = {
      ...( currentObservation.toJSON
        ? currentObservation.toJSON( )
        : currentObservation ),
      ...keysAndValues
    };
    updatedObservations[currentObservationIndex] = updatedObservation;
    updateObservations( [...updatedObservations] );
  }, [
    currentObservation,
    currentObservationIndex,
    observations,
    updateObservations
  ] );

  // TODO: this block makes a prediction whenever the selected photo changes.
  console.log( "selectedPhotoUri :>> ", selectedPhotoUri );
  predictImage( selectedPhotoUri )
    .then( predictions => {
      console.log( "predictions :>> ", predictions );
    } )
    .catch( e => {
      console.log( "e :>> ", e );
    } );

  useEffect( ( ) => {
    // If the photos are different, we need to display different photos
    // (probably b/c we're looking at a different observation)
    if ( difference( obsPhotoUris, photoEvidenceUris ).length > 0 ) {
      setPhotoEvidenceUris( obsPhotoUris );
      // And if the photos have changed, we should show results for the first
      // one
      setSelectedPhotoUri( obsPhotoUris[0] );
    }
  }, [
    obsPhotoUris,
    photoEvidenceUris,
    setPhotoEvidenceUris
  ] );

  const uploadParams = {
    image: selectedPhotoUri,
    latitude: localObservation?.latitude || currentObservation?.latitude,
    longitude: localObservation?.longitude || currentObservation?.longitude
  };

  const { data: nearbySuggestions, isLoading: loadingSuggestions } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        uploadParams.image,
        uploadParams.latitude,
        uploadParams.longitude
      ),
      optsWithAuth
    ),
    {
      enabled: !!selectedPhotoUri
    }
  );

  const onTaxonChosen = useCallback( newTaxon => {
    const newIdentification = Identification.new( {
      taxon: newTaxon,
      body: comment
    } );
    if ( !obsUUID ) {
      setLoading( true );
      updateObservationKeys( {
        owners_identification_from_vision: true,
        taxon: newIdentification.taxon
      } );
      navigation.goBack( );
    } else {
      navigation.navigate( "ObsDetails", {
        uuid: obsUUID,
        taxonSuggested: newIdentification.taxon,
        comment,
        vision: true
      } );
    }
  }, [
    navigation,
    updateObservationKeys,
    obsUUID,
    comment
  ] );

  return (
    <Suggestions
      comment={comment}
      currentObservation={currentObservation}
      loading={loading}
      loadingSuggestions={loadingSuggestions && photoEvidenceUris.length > 0}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={onTaxonChosen}
      photoUris={photoEvidenceUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
    />
  );
};

export default SuggestionsContainer;
