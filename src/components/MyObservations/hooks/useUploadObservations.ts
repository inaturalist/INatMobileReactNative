import { useNavigation } from "@react-navigation/native";
import { deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import {
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

export default useUploadObservations = ( ) => {
  const realm = useRealm( );

  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const currentUpload = useStore( state => state.currentUpload );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const uploadQueue = useStore( state => state.uploadQueue );
  const uploadStatus = useStore( state => state.uploadStatus );

  // The existing abortController lets you abort...
  const abortController = useStore( storeState => storeState.abortController );
  // ...but whenever you start a new abortable upload process, you need to
  //    mint a new abort controller
  const newAbortController = useStore( storeState => storeState.newAbortController );

  const navigation = useNavigation( );
  const { t } = useTranslation( );

  useEffect( () => {
    let timer;
    if ( [UPLOAD_COMPLETE, UPLOAD_CANCELLED].indexOf( uploadStatus ) >= 0 ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
      }, 5000 );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [uploadStatus, resetUploadObservationsSlice] );

  useEffect( ( ) => {
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];
        updateTotalUploadProgress( uuid, increment );
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [
    updateTotalUploadProgress
  ] );

  const uploadObservationAndCatchError = useCallback( async observation => {
    setCurrentUpload( observation );
    try {
      const timeoutID = setTimeout( ( ) => abortController.abort( ), 15_000 );
      await uploadObservation( observation, realm, { signal: abortController.signal } );
      clearTimeout( timeoutID );
    } catch ( uploadError: any ) {
      if ( uploadError.name === "AbortError" ) {
        addUploadError( "aborted", observation.uuid );
      } else {
        const message = handleUploadError( uploadError, t );
        addUploadError( message, observation.uuid );
      }
    } finally {
      removeFromUploadQueue( );
      if (
        uploadQueue.length === 0
        && !currentUpload
      ) {
        completeUploads( );
      }
    }
  }, [
    abortController,
    addUploadError,
    completeUploads,
    currentUpload,
    realm,
    removeFromUploadQueue,
    setCurrentUpload,
    t,
    uploadQueue
  ] );

  useEffect( ( ) => {
    const startUpload = async ( ) => {
      const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
      const localObservation = realm.objectForPrimaryKey( "Observation", lastQueuedUuid );
      if ( localObservation ) {
        newAbortController( );
        await uploadObservationAndCatchError( localObservation );
      }
    };
    if ( uploadStatus === UPLOAD_IN_PROGRESS
      && uploadQueue.length > 0
      && !currentUpload
    ) {
      startUpload( );
    }
  }, [
    currentUpload,
    newAbortController,
    realm,
    uploadObservationAndCatchError,
    uploadQueue,
    uploadStatus
  ] );

  useEffect( ( ) => {
    if ( uploadStatus === UPLOAD_PENDING ) {
      const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
      const numUnuploadedObs = allUnsyncedObservations.length;
      setNumUnuploadedObservations( numUnuploadedObs );
    }
  }, [
    realm,
    setNumUnuploadedObservations,
    uploadStatus
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        resetUploadObservationsSlice( );
      } );
    },
    [
      navigation,
      resetUploadObservationsSlice
    ]
  );

  useEffect( ( ) => {
    // fully stop uploads when cancel upload button is tapped
    if ( uploadStatus === UPLOAD_CANCELLED ) {
      abortController.abort( );
      deactivateKeepAwake( );
    }
  }, [abortController, uploadStatus] );
};
