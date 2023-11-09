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
import emitUploadProgress from "sharedHelpers/emitUploadProgress";

const UPLOAD_PROGRESS_INCREMENT = 0.5;

const markRecordUploaded = ( recordUUID, type, response, realm ) => {
  if ( !response ) { return; }
  const { id } = response.results[0];

  const record = realm.objectForPrimaryKey( type, recordUUID );
  realm?.write( ( ) => {
    record.id = id;
    record._synced_at = new Date( );
  } );
};

const uploadToServer = async (
  evidenceUUID: string,
  type: string,
  params: Object,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
) => {
  emitUploadProgress( observationUUID, UPLOAD_PROGRESS_INCREMENT );
  const response = await createOrUpdateEvidence(
    apiEndpoint,
    params,
    options
  );
  if ( response ) {
    emitUploadProgress( observationUUID, UPLOAD_PROGRESS_INCREMENT );
    markRecordUploaded( evidenceUUID, type, response, realm );
  }
};

const uploadEvidence = async (
  evidence: Array<Object>,
  type: string,
  apiSchemaMapper: Function,
  observationId: ?number,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  forceUpload?: boolean,
  realm: Object
): Promise<any> => {
  // only try to upload evidence which is not yet on the server
  const unsyncedEvidence = forceUpload
    ? evidence
    : evidence.filter( item => !item.wasSynced( ) );

  const responses = await Promise.all( unsyncedEvidence.map( item => {
    const currentEvidence = item.toJSON( );
    const evidenceUUID = currentEvidence.uuid;

    // Remove all null values, b/c the API doesn't seem to like them
    const newPhoto = {};
    const photo = currentEvidence?.photo;
    Object.keys( photo ).forEach( k => {
      if ( photo[k] !== null ) {
        newPhoto[k] = photo[k];
      }
    } );

    currentEvidence.photo = newPhoto;

    const params = apiSchemaMapper( observationId, currentEvidence );
    return uploadToServer(
      evidenceUUID,
      type,
      params,
      apiEndpoint,
      options,
      observationUUID,
      realm
    );
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
  activateKeepAwake( );
  // every observation and observation photo counts for a total of 1 progress
  // we're showing progress in 0.5 increments: when an upload of obs/obsPhoto starts
  // and when the upload of obs/obsPhoto successfully completes
  emitUploadProgress( obs.uuid, UPLOAD_PROGRESS_INCREMENT );
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

  await Promise.all( [
    hasPhotos
      ? await uploadEvidence(
        obs.observationPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForUpload,
        null,
        inatjs.photos.create,
        options,
        "",
        false,
        realm
      )
      : null
  ] );

  const wasPreviouslySynced = obs.wasSynced( );
  const uploadParams = {
    observation: { ...newObs },
    fields: { id: true }
  };

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
    markRecordUploaded( obs.uuid, "Observation", response, realm ),
    // Next, attach the uploaded photos/sounds to the uploaded observation
    hasPhotos
      ? await uploadEvidence(
        obs.observationPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForAttachingToObs,
        obsUUID,
        inatjs.observation_photos.create,
        options,
        obsUUID,
        true,
        realm
      )
      : null
  ] );
  deactivateKeepAwake( );
  return response;
};

export default uploadObservation;
