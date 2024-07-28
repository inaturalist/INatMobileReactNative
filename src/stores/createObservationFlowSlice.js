// eslint-disable-next-line
import { Realm } from "@realm/react";
import _ from "lodash";
import Photo from "realmModels/Photo";
import Sound from "realmModels/Sound";

const DEFAULT_STATE = {
  cameraRollUris: [],
  comment: "",
  currentObservation: {},
  currentObservationIndex: 0,
  evidenceToAdd: [],
  galleryUris: [],
  groupedPhotos: [],
  observations: [],
  // Track when any obs was last marked as viewed so we know when to update
  // the notifications indicator
  observationMarkedAsViewedAt: null,
  // Array of URIs of photos taken in the camera. These should be fully
  // processed, including rotation or any other transformations. It might
  // also include URIs of other photos that need to be visible as previews in
  // the camera
  cameraUris: [],
  savingPhoto: false,
  unsavedChanges: false
};

const removeObsSoundFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObservation = currentObservation;
  const obsSounds = Array.from( currentObservation?.observationSounds );
  if ( obsSounds.length > 0 ) {
    _.remove(
      obsSounds,
      obsSound => (
        obsSound.sound.file_url === uri
        || Sound.getLocalSoundUri( obsSound.sound.file_url ) === uri
      )
    );
    updatedObservation.observationSounds = obsSounds;
    return [updatedObservation];
  }
  return [currentObservation];
};

const observationToJSON = observation => ( observation instanceof Realm.Object
  ? observation.toJSON( )
  : observation );

const updateObservationKeysWithState = ( keysAndValues, state ) => {
  const {
    observations,
    currentObservation,
    currentObservationIndex
  } = state;
  const updatedObservations = observations;
  const updatedObservation = {
    ...observationToJSON( currentObservation ),
    ...keysAndValues
  };
  updatedObservations[currentObservationIndex] = updatedObservation;
  return updatedObservations;
};

const createObservationFlowSlice = ( set, get ) => ( {
  ...DEFAULT_STATE,
  deletePhotoFromObservation: uri => set( state => {
    const newObservations = [...state.observations];
    let newObservation = null;

    if ( newObservations.length > 0 ) {
      newObservation = newObservations[state.currentObservationIndex];
      const index = newObservation.observationPhotos.findIndex(
        op => ( Photo.getLocalPhotoUri( op.photo?.localFilePath ) || op.photo?.url ) === uri
      );
      if ( index > -1 ) {
        newObservation.observationPhotos.splice( index, 1 );
      }
    }

    const newCameraUris = [..._.pull( state.cameraUris, uri )];
    return {
      cameraUris: newCameraUris,
      evidenceToAdd: [..._.pull( state.evidenceToAdd, uri )],
      observations: newObservations,
      currentObservation: newObservation
        ? observationToJSON( newObservation )
        : null
    };
  } ),
  deleteSoundFromObservation: uri => set( state => {
    const newObservations = removeObsSoundFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    );
    const newObservation = newObservations[state.currentObservationIndex];
    return {
      observations: newObservations,
      currentObservation: newObservation
    };
  } ),
  resetObservationFlowSlice: ( ) => set( DEFAULT_STATE ),
  addCameraRollUri: uri => set( state => {
    const savedUris = state.cameraRollUris;
    savedUris.push( uri );
    return ( {
      cameraRollUris: savedUris,
      savingPhoto: false
    } );
  } ),
  setSavingPhoto: saving => set( { savingPhoto: saving } ),
  setCameraState: options => set( state => ( {
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    cameraUris:
      options?.cameraUris || state.cameraUris
  } ) ),
  setCurrentObservationIndex: index => set( state => ( {
    currentObservationIndex: index,
    currentObservation: observationToJSON( state.observations[index] )
  } ) ),
  setGroupedPhotos: photos => set( {
    groupedPhotos: photos
  } ),
  setObservationMarkedAsViewedAt: date => set( {
    observationMarkedAsViewedAt: date
  } ),
  setObservations: updatedObservations => set( state => ( {
    observations: updatedObservations.map( observationToJSON ),
    currentObservation: observationToJSON( updatedObservations[state.currentObservationIndex] )
  } ) ),
  setPhotoImporterState: options => set( state => ( {
    galleryUris: options?.galleryUris || state.galleryUris,
    savingPhoto: options?.savingPhoto || state.savingPhoto,
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    groupedPhotos: options?.groupedPhotos || state.groupedPhotos,
    observations: options?.observations || state.observations,
    currentObservation: observationToJSON(
      options?.observations?.[state.currentObservationIndex]
      || state.observations?.[state.currentObservationIndex]
    ),
    firstObservationDefaults: options?.firstObservationDefaults
  } ) ),
  updateComment: newComment => set( { comment: newComment } ),
  updateObservations: updatedObservations => set( state => ( {
    observations: updatedObservations.map( observationToJSON ),
    currentObservation: observationToJSON( updatedObservations[state.currentObservationIndex] ),
    unsavedChanges: true
  } ) ),
  updateObservationKeys: keysAndValues => set( state => ( {
    observations: updateObservationKeysWithState( keysAndValues, state ),
    currentObservation:
      updateObservationKeysWithState( keysAndValues, state )[state.currentObservationIndex],
    unsavedChanges: true
  } ) ),
  // Prepare state for showing ObsEdit for a single observation
  prepareObsEdit: observation => {
    get( ).resetObservationFlowSlice( );
    get( ).updateObservations( [observation] );
  },
  prepareCamera: () => {
    const existingPhotoUris = get( )
      .currentObservation
      ?.observationPhotos
      ?.map( op => ( op.photo.url || Photo.getLocalPhotoUri( op.photo.localFilePath ) ) ) || [];
    return set( { evidenceToAdd: [], cameraUris: existingPhotoUris } );
  }
} );

export default createObservationFlowSlice;
