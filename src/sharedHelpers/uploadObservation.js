// @flow
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  createObservation,
  createOrUpdateEvidence,
  updateObservation
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";
import emitUploadProgress from "sharedHelpers/emitUploadProgress";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const UPLOAD_PROGRESS_INCREMENT = 1;

const markRecordUploaded = (
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  response: {
    results: Array<{id: Number}>
  },
  realm: Object
) => {
  const { id } = response.results[0];
  const observation = realm?.objectForPrimaryKey( "Observation", observationUUID );

  let record;

  if ( type === "Observation" ) {
    record = observation;
  } else if ( type === "ObservationPhoto" ) {
    const existingObsPhoto = observation.observationPhotos?.find( p => p.uuid === recordUUID );
    record = existingObsPhoto;
  } else if ( type === "ObservationSound" ) {
    const existingObsSound = observation.observationSounds?.find( p => p.uuid === recordUUID );
    record = existingObsSound;
  }

  safeRealmWrite( realm, ( ) => {
    record.id = id;
    record._synced_at = new Date( );
  }, "marking record uploaded in uploadObservation.js" );
};

const uploadEvidence = async (
  evidence: Array<Object>,
  type: string,
  apiSchemaMapper: Function,
  observationId: ?number,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
): Promise<any> => {
  const uploadToServer = async currentEvidence => {
    const params = apiSchemaMapper( observationId, currentEvidence );
    const evidenceUUID = currentEvidence.uuid;

    const response = await createOrUpdateEvidence(
      apiEndpoint,
      params,
      options
    );

    if ( response && observationUUID ) {
      // we're emitting progress increments:
      // one when the upload of obs
      // half one when obsPhoto/obsSound is successfully uploaded
      // half one when the obsPhoto/obsSound is attached to the obs
      emitUploadProgress( observationUUID, ( UPLOAD_PROGRESS_INCREMENT / 2 ) );
      // TODO: can't mark records as uploaded by primary key for ObsPhotos and ObsSound anymore
      markRecordUploaded( observationUUID, evidenceUUID, type, response, realm );
    }

    return response;
  };

  const responses = await Promise.all( evidence.map( item => {
    const currentEvidence = item.toJSON( );

    if ( currentEvidence.photo ) {
      // Remove all null values, b/c the API doesn't seem to like them
      const newPhoto = {};
      const { photo } = currentEvidence;
      Object.keys( photo ).forEach( k => {
        if ( photo[k] !== null ) {
          newPhoto[k] = photo[k];
        }
      } );
      currentEvidence.photo = newPhoto;
    }

    return uploadToServer( currentEvidence );
  } ) );
  // eslint-disable-next-line consistent-return
  return responses[0];
};

const uploadObservation = async ( obs: Object, realm: Object ): Object => {
  const apiToken = await getJWT( );
  // don't bother trying to upload unless there's a logged in user
  if ( !apiToken ) {
    throw new Error(
      "Gack, tried to upload an observation without API token!"
    );
  }
  activateKeepAwake();
  const obsToUpload = Observation.mapObservationForUpload( obs );
  const options = { api_token: apiToken };

  // Remove all null values, b/c the API doesn't seem to like them for some
  // reason (might be an error with the API as of 20220801)
  const newObs = {};
  Object.keys( obsToUpload ).forEach( k => {
    if ( obsToUpload[k] !== null ) {
      newObs[k] = obsToUpload[k];
    }
  } );

  let response;

  // First upload the photos/sounds (before uploading the observation itself)
  const hasPhotos = obs?.observationPhotos?.length > 0;
  const unsyncedPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( item => !item.wasSynced( ) )
    : [];
  const modifiedPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( item => item.wasSynced( ) && item.needsSync( ) )
    : [];

  await Promise.all( [
    unsyncedPhotos.length > 0
      ? await uploadEvidence(
        unsyncedPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForUpload,
        null,
        inatjs.photos.create,
        options,
        obs.uuid,
        realm
      )
      : null
  ] );

  const hasSounds = obs.observationSounds.length > 0;
  const unsyncedSounds = hasSounds
    ? obs.observationSounds.filter( item => !item.wasSynced( ) )
    : [];
  await Promise.all( [
    unsyncedSounds.length > 0
      ? await uploadEvidence(
        unsyncedSounds,
        "ObservationSound",
        ObservationSound.mapSoundForUpload,
        null,
        inatjs.sounds.create,
        options,
        obs.uuid,
        realm
      )
      : null
  ] );

  const wasPreviouslySynced = obs.wasSynced( );
  const uploadParams = {
    observation: { ...newObs },
    fields: { id: true }
  };

  // we're emitting progress increments:
  // one when the upload of obs
  // half one when obsPhoto/obsSound is successfully uploaded
  // half one when the obsPhoto/obsSound is attached to the obs
  if ( wasPreviouslySynced ) {
    response = await updateObservation( {
      ...uploadParams,
      id: newObs.uuid,
      ignore_photos: true
    }, options );
    emitUploadProgress( obs.uuid, UPLOAD_PROGRESS_INCREMENT );
  } else {
    response = await createObservation( uploadParams, options );
    emitUploadProgress( obs.uuid, UPLOAD_PROGRESS_INCREMENT );
  }

  if ( !response ) {
    return response;
  }

  const { uuid: obsUUID } = response.results[0];

  await Promise.all( [
    markRecordUploaded( obs.uuid, null, "Observation", response, realm ),
    // Attach the newly uploaded photos/sounds to the uploaded observation
    unsyncedPhotos.length > 0
      ? await uploadEvidence(
        unsyncedPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForAttachingToObs,
        obsUUID,
        inatjs.observation_photos.create,
        options,
        obsUUID,
        realm
      )
      : null,
    unsyncedSounds.length > 0
      ? await uploadEvidence(
        unsyncedSounds,
        "ObservationSound",
        ObservationSound.mapSoundForAttachingToObs,
        obsUUID,
        inatjs.observation_sounds.create,
        options,
        obsUUID,
        realm
      )
      : null,
    // Update any existing modified photos/sounds
    modifiedPhotos.length > 0
      ? await uploadEvidence(
        modifiedPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForUpdating,
        obsUUID,
        inatjs.observation_photos.update,
        options,
        obsUUID,
        realm
      )
      : null
  ] );
  deactivateKeepAwake( );
  return response;
};

export default uploadObservation;
