// @flow
import { INatApiError } from "api/error";
import {
  createObservation,
  createOrUpdateEvidence,
  fetchRemoteObservation,
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

// The reason this doesn't simply accept the record is because we're not being
// strict about using Realm.Objects, so sometimes the thing we just uploaded
// is a Realm.Object and sometimes it's a POJO, but in order to mark it as
// uploaded and add a server-assigned id attribute, we need to find the
// matching Realm.Object
const markRecordUploaded = (
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  response: {
    results: Array<{id: number}>
  },
  realm: Object,
  options?: {
    record: Object
  }
) => {
  const { id } = response.results[0];
  const observation = realm?.objectForPrimaryKey( "Observation", observationUUID );

  let record;

  if ( type === "Observation" ) {
    record = observation;
  } else if ( type === "ObservationPhoto" ) {
    const existingObsPhoto = observation.observationPhotos?.find( op => op.uuid === recordUUID );
    record = existingObsPhoto;
  } else if ( type === "ObservationSound" ) {
    const existingObsSound = observation.observationSounds?.find( os => os.uuid === recordUUID );
    record = existingObsSound;
  } else if ( type === "Photo" ) {
    // Photos do not have UUIDs, so we pass the Photo itself as an option
    record = options?.record;
  }

  if ( !record ) {
    throw new Error(
      `Cannot find local Realm object, type: ${type}, recordUUID: ${recordUUID || ""}`
    );
  }

  safeRealmWrite( realm, ( ) => {
    // These flow errors don't make any sense b/c if record is undefined, we
    // will throw an error above
    // $FlowIgnore
    record.id = id;
    // $FlowIgnore
    record._synced_at = new Date( );
  }, `marking record uploaded in uploadObservation.js, type: ${type}` );
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
  // $FlowIgnore
): Promise<unknown> => {
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
      await markRecordUploaded( observationUUID, evidenceUUID, type, response, realm, {
        record: currentEvidence
      } );
    }

    return response;
  };

  const responses = await Promise.all( evidence.map( item => {
    let currentEvidence = item;

    if ( currentEvidence.photo ) {
      currentEvidence = item.toJSON( );
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

const uploadObservation = async ( obs: Object, realm: Object, opts: Object = {} ): Object => {
  const apiToken = await getJWT( );
  // don't bother trying to upload unless there's a logged in user
  if ( !apiToken ) {
    throw new Error(
      "Gack, tried to upload an observation without API token!"
    );
  }
  const obsToUpload = Observation.mapObservationForUpload( obs );
  const options = { ...opts, api_token: apiToken };

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
  const unsyncedObservationPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( op => !op.wasSynced( ) )
    : [];
  const unsyncedPhotos = unsyncedObservationPhotos?.map( op => op.photo );
  const modifiedObservationPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( op => op.wasSynced( ) && op.needsSync( ) )
    : [];

  await Promise.all( [
    unsyncedPhotos.length > 0
      ? await uploadEvidence(
        unsyncedPhotos,
        "Photo",
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
  const unsyncedObservationSounds = hasSounds
    ? obs.observationSounds.filter( item => !item.wasSynced( ) )
    : [];
  await Promise.all( [
    unsyncedObservationSounds.length > 0
      ? await uploadEvidence(
        unsyncedObservationSounds,
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
    // Attach the newly uploaded photos/sounds to the uploaded observation
    unsyncedObservationPhotos.length > 0
      ? await uploadEvidence(
        unsyncedObservationPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForAttachingToObs,
        obsUUID,
        inatjs.observation_photos.create,
        options,
        obsUUID,
        realm
      )
      : null,
    unsyncedObservationSounds.length > 0
      ? await uploadEvidence(
        unsyncedObservationSounds,
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
    modifiedObservationPhotos.length > 0
      ? await uploadEvidence(
        modifiedObservationPhotos,
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
  // Make sure this happens *after* ObservationPhotos and ObservationSounds
  // are created so the observation doesn't appear uploaded until all its
  // media successfully uploads
  await markRecordUploaded( obs.uuid, null, "Observation", response, realm );
  // fetch observation and upsert it
  const remoteObs = await fetchRemoteObservation( obsUUID, { fields: Observation.FIELDS } );
  Observation.upsertRemoteObservations( [remoteObs], realm, { force: true } );
  return response;
};

export function handleUploadError( uploadError: Error | INatApiError, t: Function ): string {
  let { message } = uploadError;
  // uploadError might be an INatApiError but I don't know how to tell flow to
  // shut up about the possibility that uploadError might not have this
  // attribute... even though ?. will prevent that from being a problem.
  // ~~~~kueda20240523
  // $FlowIgnore
  if ( uploadError?.json?.errors ) {
    // TODO localize comma join
    message = uploadError.json.errors.map( e => {
      if ( e.message?.errors ) {
        return e.message.errors.flat( ).join( ", " );
      }
      return e.message;
    } ).join( ", " );
  } else if ( uploadError.message?.match( /Network request failed/ ) ) {
    message = t( "Connection-problem-Please-try-again-later" );
  } else {
    throw uploadError;
  }
  return message;
}

export default uploadObservation;
