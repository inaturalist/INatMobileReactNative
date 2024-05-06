// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import {
  checkForDeletedObservations, searchObservations
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { format } from "date-fns";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useReducer, useState
} from "react";
import { Alert } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import uploadObservation from "sharedHelpers/uploadObservation";
import { sleep } from "sharedHelpers/util";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useNumUnuploadedObservations,
  useObservationsUpdates,
  useStoredLayout,
  useTranslation
} from "sharedHooks";

import useDeleteObservations from "./hooks/useDeleteObservations";
import MyObservations from "./MyObservations";

const logger = log.extend( "MyObservationsContainer" );

export const INITIAL_STATE = {
  error: null,
  singleUpload: true,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  // $FlowIgnore
  uploadProgress: { },
  // $FlowIgnore
  uploads: [],
  numToUpload: 0,
  numFinishedUploads: 0,
  uploadsComplete: false,
  syncInProgress: false
};

const startUploadState = uploads => ( {
  error: null,
  uploadInProgress: true,
  uploadsComplete: false,
  uploads,
  numToUpload: uploads.length,
  numFinishedUploads: 0,
  uploadProgress: { },
  totalProgressIncrements: uploads.reduce(
    ( count, current ) => count
      + ( current?.observationPhotos?.length || 0 )
      + ( current?.observationSounds?.length || 0 ),
    uploads.length
  )
} );

const uploadReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "PAUSE_UPLOADS":
      return {
        ...state,
        uploadInProgress: false
      };
    case "SET_UPLOAD_ERROR":
      return {
        ...state,
        error: action.error,
        uploadInProgress: false
      };
    case "SET_UPLOADS":
      return {
        ...state,
        uploads: action.uploads
      };
    case "START_UPLOAD":
      return {
        ...state,
        ...startUploadState( action.observation
          ? [action.observation]
          : state.uploads ),
        singleUpload: action.singleUpload
      };
    case "START_NEXT_UPLOAD":
      return {
        ...state,
        numFinishedUploads: state.numFinishedUploads + 1
      };
    case "STOP_UPLOADS":
      return {
        ...state,
        ...INITIAL_STATE
      };
    case "UPLOADS_COMPLETE":
      return {
        ...state,
        uploadInProgress: false,
        uploadsComplete: true
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: action.uploadProgress
      };
    case "RESET_STATE":
      return {
        ...INITIAL_STATE
      };
    case "START_SYNC":
      return {
        ...state,
        syncInProgress: true
      };
    default:
      return state;
  }
};

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const allObsToUpload = Observation.filterUnsyncedObservations( realm );
  const { params: navParams } = useRoute( );
  const [state, dispatch] = useReducer( uploadReducer, INITIAL_STATE );
  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );
  const { deletionsCompletedAt } = useDeleteObservations( );
  const numUnuploadedObservations = useNumUnuploadedObservations( );

  const isOnline = useIsConnected( );

  const currentUser = useCurrentUser();

  useObservationsUpdates( !!currentUser );
  const {
    fetchNextPage,
    isFetchingNextPage,
    observations: data,
    status
  } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );

  const {
    error,
    uploads,
    uploadsComplete,
    uploadProgress,
    uploadInProgress,
    totalProgressIncrements
  } = state;

  useEffect( () => {
    let timer;
    if ( uploadsComplete && !error ) {
      timer = setTimeout( () => {
        dispatch( { type: "RESET_STATE" } );
      }, 5000 );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [uploadsComplete, error] );

  const currentUploadProgress = Object.values( uploadProgress ).reduce(
    ( count, current ) => count + Number( current ),
    0
  );

  let toolbarProgress = 0;
  if ( uploadInProgress && totalProgressIncrements > 0 ) {
    toolbarProgress = 0.1 / totalProgressIncrements;
  }
  if ( totalProgressIncrements > 0 && currentUploadProgress > 0 ) {
    toolbarProgress = currentUploadProgress / totalProgressIncrements;
  }

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  useEffect( ( ) => {
    // show progress in toolbar for observations uploaded on ObsEdit
    if ( navParams?.uuid && !state.uploadInProgress && currentUser ) {
      const savedObservation = realm?.objectForPrimaryKey( "Observation", navParams?.uuid );
      const wasSynced = savedObservation?.wasSynced( );
      if ( !wasSynced ) {
        dispatch( {
          type: "START_UPLOAD",
          observation: savedObservation,
          singleUpload: true
        } );
      }
    }
  }, [navParams, state.uploadInProgress, realm, currentUser] );

  useEffect( ( ) => {
    let currentProgress = state.uploadProgress;
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];

        if ( state.singleUpload && !currentProgress[uuid] ) {
          currentProgress = { };
        }

        currentProgress[uuid] = ( state.uploadProgress[uuid] || 0 ) + increment;

        // This is really hacky, but our obs upload logic is distributed so much that I can not
        // figure out a better way to do this. This is true for an observation without media
        // for which this useEffect is only triggered once, and therefore the UPLOADS_COMPLETE
        // action is never dispatched.
        const isOne = state.totalProgressIncrements === 1;
        if (
          state.singleUpload
          && (
            state.uploadProgress[uuid] >= state.totalProgressIncrements
            || isOne
          )
        ) {
          if ( isOne ) {
            dispatch( {
              type: "UPDATE_PROGRESS",
              uploadProgress: currentProgress
            } );
          }
          dispatch( {
            type: "UPLOADS_COMPLETE"
          } );
        } else {
          dispatch( {
            type: "UPDATE_PROGRESS",
            uploadProgress: currentProgress
          } );
        }
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [state.uploadProgress, state.singleUpload, state.totalProgressIncrements, uploadInProgress] );

  const showInternetErrorAlert = useCallback( ( ) => {
    Alert.alert(
      t( "Internet-Connection-Required" ),
      t( "Please-try-again-when-you-are-connected-to-the-internet" )
    );
  }, [t] );

  const toggleLoginSheet = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
  }, [currentUser] );

  const stopUploads = useCallback( ( ) => {
    dispatch( { type: "STOP_UPLOADS" } );
    deactivateKeepAwake( );
  }, [] );

  const downloadRemoteObservationsFromServer = useCallback( async ( ) => {
    const apiToken = await getJWT( );
    const searchParams = {
      user_id: currentUser?.id,
      per_page: 50,
      fields: Observation.FIELDS,
      ttl: -1
    };
    // Between elasticsearch update time and API caches, there's no absolute
    // guarantee fetching observations won't include something we just
    // deleted, so we check to see if deletions recently completed and if
    // they did, make sure 10s have elapsed since deletions complated before
    // fetching new obs
    if ( deletionsCompletedAt ) {
      const msSinceDeletionsCompleted = ( new Date( ) - deletionsCompletedAt );
      if ( msSinceDeletionsCompleted < 5_000 ) {
        const naptime = 10_000 - msSinceDeletionsCompleted;
        logger.info(
          "[MyObservationsContainer.js] downloadRemoteObservationsFromServer finished deleting "
          + `recently deleted, waiting ${naptime} ms`
        );
        await sleep( naptime );
      }
    }
    logger.info(
      "[MyObservationsContainer.js] downloadRemoteObservationsFromServer, fetching observations"
    );
    const { results } = await searchObservations( searchParams, { api_token: apiToken } );
    logger.info(
      "[MyObservationsContainer.js] downloadRemoteObservationsFromServer, fetched",
      results.length,
      "results, upserting..."
    );
    Observation.upsertRemoteObservations( results, realm );
  }, [
    currentUser,
    deletionsCompletedAt,
    realm
  ] );

  // TODO move this logic to a helper or a model so it can be more easily unit tested
  const syncRemoteDeletedObservations = useCallback( async ( ) => {
    const apiToken = await getJWT( );
    const lastSyncTime = realm.objects( "LocalPreferences" )?.[0]?.last_sync_time;
    const deletedParams = { since: format( new Date( ), "yyyy-MM-dd" ) };
    if ( lastSyncTime ) {
      try {
        deletedParams.since = format( lastSyncTime, "yyyy-MM-dd" );
      } catch ( lastSyncTimeFormatError ) {
        if ( lastSyncTimeFormatError instanceof RangeError ) {
          // If we can't parse that date, assume we've never synced and use the default
        } else {
          throw lastSyncTimeFormatError;
        }
      }
    }
    const response = await checkForDeletedObservations( deletedParams, { api_token: apiToken } );
    const deletedObservations = response?.results;
    if ( !deletedObservations ) { return; }
    if ( deletedObservations?.length > 0 ) {
      safeRealmWrite( realm, ( ) => {
        const localObservationsToDelete = realm.objects( "Observation" )
          .filtered( `id IN { ${deletedObservations} }` );
        localObservationsToDelete.forEach( observation => {
          realm.delete( observation );
        } );
      }, "deleting remote deleted observations in MyObservationsContainer" );
    }
  }, [realm] );

  const updateSyncTime = useCallback( ( ) => {
    const localPrefs = realm.objects( "LocalPreferences" )[0];
    const updatedPrefs = {
      ...localPrefs,
      last_sync_time: new Date( )
    };
    safeRealmWrite( realm, ( ) => {
      realm.create( "LocalPreferences", updatedPrefs, "modified" );
    }, "updating sync time in MyObservationsContainer" );
  }, [realm] );

  const syncObservations = useCallback( async ( ) => {
    logger.info( "[MyObservationsContainer.js] syncObservations: starting" );
    if ( !uploadInProgress && uploadsComplete ) {
      logger.info( "[MyObservationsContainer.js] syncObservations: dispatch RESET_STATE" );
      dispatch( { type: "RESET_STATE" } );
    }
    logger.info( "[MyObservationsContainer.js] syncObservations: calling toggleLoginSheet" );
    if ( !currentUser ) {
      toggleLoginSheet( );
      dispatch( { type: "RESET_STATE" } );
      return;
    }
    logger.info( "[MyObservationsContainer.js] syncObservations: calling showInternetErrorAlert" );
    if ( !isOnline ) {
      showInternetErrorAlert( );
      dispatch( { type: "RESET_STATE" } );
      return;
    }
    dispatch( { type: "START_SYNC" } );
    logger.info( "[MyObservationsContainer.js] syncObservations: calling activateKeepAwake" );
    activateKeepAwake( );
    logger.info(
      "[MyObservationsContainer.js] syncObservations: calling syncRemoteDeletedObservations"
    );
    await syncRemoteDeletedObservations( );
    logger.info(
      "[MyObservationsContainer.js] syncObservations: calling downloadRemoteObservationsFromServer"
    );
    await downloadRemoteObservationsFromServer( );
    logger.info( "[MyObservationsContainer.js] syncObservations: calling updateSyncTime" );
    updateSyncTime( );
    logger.info( "[MyObservationsContainer.js] syncObservations: calling deactivateKeepAwake" );
    deactivateKeepAwake( );
    dispatch( { type: "RESET_STATE" } );
    logger.info( "[MyObservationsContainer.js] syncObservations: done" );
  }, [
    currentUser,
    downloadRemoteObservationsFromServer,
    isOnline,
    showInternetErrorAlert,
    syncRemoteDeletedObservations,
    toggleLoginSheet,
    updateSyncTime,
    uploadInProgress,
    uploadsComplete
  ] );

  const uploadObservationAndCatchError = useCallback( async observation => {
    try {
      await uploadObservation( observation, realm );
    } catch ( uploadError ) {
      let { message } = uploadError;
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
        logger.error(
          `[MyObservationsContainer.js] upload failed due to network problem: ${uploadError}`
        );
      } else {
        logger.error( `[MyObservationsContainer.js] upload failed: ${uploadError}` );
        throw uploadError;
      }
      dispatch( { type: "SET_UPLOAD_ERROR", error: message } );
    }
  }, [
    realm,
    t
  ] );

  const uploadSingleObservation = useCallback( async ( observation, options ) => {
    if ( !currentUser ) {
      toggleLoginSheet( );
      return;
    }
    if ( !isOnline ) {
      showInternetErrorAlert( );
      return;
    }
    if ( !options || options?.singleUpload !== false ) {
      dispatch( { type: "START_UPLOAD", observation, singleUpload: true } );
    }
    await uploadObservationAndCatchError( observation );
    dispatch( { type: "UPLOADS_COMPLETE" } );
  }, [
    currentUser,
    isOnline,
    showInternetErrorAlert,
    toggleLoginSheet,
    uploadObservationAndCatchError
  ] );

  const uploadMultipleObservations = useCallback( async ( ) => {
    if ( !currentUser ) {
      toggleLoginSheet( );
      return;
    }
    if ( numUnuploadedObservations === 0 || uploadInProgress ) {
      return;
    }
    if ( !isOnline ) {
      showInternetErrorAlert( );
      return;
    }
    dispatch( { type: "START_UPLOAD", singleUpload: uploads.length === 1 } );

    try {
      await Promise.all( uploads.map( async obsToUpload => {
        await uploadObservationAndCatchError( obsToUpload );
        dispatch( { type: "START_NEXT_UPLOAD" } );
      } ) );
      dispatch( { type: "UPLOADS_COMPLETE" } );
    } catch ( uploadMultipleObservationsError ) {
      logger.error( "Failed to uploadMultipleObservations: ", uploadMultipleObservationsError );
      dispatch( {
        type: "SET_UPLOAD_ERROR",
        error: t( "Something-went-wrong" )
      } );
    }
  }, [
    currentUser,
    isOnline,
    numUnuploadedObservations,
    showInternetErrorAlert,
    t,
    toggleLoginSheet,
    uploadInProgress,
    uploadObservationAndCatchError,
    uploads
  ] );

  useEffect( ( ) => {
    if ( uploadInProgress || uploadsComplete ) {
      return;
    }
    if ( allObsToUpload?.length > 0 && allObsToUpload.length > uploads.length ) {
      dispatch( { type: "SET_UPLOADS", uploads: allObsToUpload } );
    }
  }, [allObsToUpload, uploads, uploadInProgress, uploadsComplete] );

  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        dispatch( { type: "RESET_STATE" } );
      } );
    },
    [navigation, realm]
  );

  if ( !layout ) { return null; }

  // remote data is available before data is synced locally; this check
  // prevents the empty list from rendering briefly when a user first logs in
  const observationListStatus = data?.length > observations?.length
    ? "loading"
    : status;

  return (
    <MyObservations
      currentUser={currentUser}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      layout={layout}
      observations={observations}
      onEndReached={fetchNextPage}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      status={observationListStatus}
      stopUploads={stopUploads}
      syncObservations={syncObservations}
      toggleLayout={toggleLayout}
      toolbarProgress={toolbarProgress}
      uploadMultipleObservations={uploadMultipleObservations}
      uploadSingleObservation={uploadSingleObservation}
      uploadState={state}
    />
  );
};

export default MyObservationsContainer;
