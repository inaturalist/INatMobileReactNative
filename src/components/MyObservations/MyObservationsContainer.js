// @flow

import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useReducer, useState
} from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep } from "sharedHelpers/util";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useObservationsUpdates,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import useClearGalleryPhotos from "./hooks/useClearGalleryPhotos";
import useClearRotatedOriginalPhotos from "./hooks/useClearRotatedOriginalPhotos";
import useClearSyncedPhotosForUpload from "./hooks/useClearSyncedPhotosForUpload";
import useClearSyncedSoundsForUpload from "./hooks/useClearSyncedSoundsForUpload";
import useDeleteObservations from "./hooks/useDeleteObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";

const logger = log.extend( "MyObservationsContainer" );

export const INITIAL_STATE = {
  canBeginDeletions: true,
  syncInProgress: false
};

const reducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "SET_START_DELETIONS":
      return {
        ...state,
        canBeginDeletions: false
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
  // clear original, large-sized photos before a user returns to any of the Camera or AICamera flows
  useClearRotatedOriginalPhotos( );
  useClearGalleryPhotos( );
  useClearSyncedPhotosForUpload( );
  useClearSyncedSoundsForUpload( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const resetUploadObservationsSlice = useStore( state => state?.resetUploadObservationsSlice );
  const uploadStatus = useStore( state => state.uploadStatus );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const setTotalToolbarIncrements = useStore( state => state.setTotalToolbarIncrements );
  const [state, dispatch] = useReducer( reducer, INITIAL_STATE );
  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const deletionsCompletedAt = useStore( s => s.deletionsCompletedAt );

  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const canUpload = currentUser && isOnline;

  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );

  useDeleteObservations(
    currentUser?.id && state.canBeginDeletions,
    dispatch
  );

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

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  const showInternetErrorAlert = useCallback( ( ) => {
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
  }, [t, isOnline] );

  const toggleLoginSheet = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
  }, [currentUser] );

  const startUpload = useCallback( ( ) => {
    toggleLoginSheet( );
    showInternetErrorAlert( );
    if ( canUpload ) {
      setUploadStatus( UPLOAD_IN_PROGRESS );
    } else {
      setUploadStatus( UPLOAD_PENDING );
    }
  }, [
    canUpload,
    setUploadStatus,
    showInternetErrorAlert,
    toggleLoginSheet
  ] );

  const {
    syncInProgress
  } = state;

  useUploadObservations( );

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
          "downloadRemoteObservationsFromServer finished deleting "
          + `recently deleted, waiting ${naptime} ms`
        );
        await sleep( naptime );
      }
    }
    logger.info(
      "downloadRemoteObservationsFromServer, fetching observations"
    );
    const { results } = await searchObservations( searchParams, { api_token: apiToken } );
    logger.info(
      "downloadRemoteObservationsFromServer, fetched",
      results.length,
      "results, upserting..."
    );
    Observation.upsertRemoteObservations( results, realm );
  }, [
    currentUser,
    deletionsCompletedAt,
    realm
  ] );

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
    if ( uploadStatus === UPLOAD_COMPLETE ) {
      resetUploadObservationsSlice( );
    }
    if ( !currentUser ) {
      toggleLoginSheet( );
      resetUploadObservationsSlice( );
      return;
    }
    if ( !isOnline ) {
      showInternetErrorAlert( );
      resetUploadObservationsSlice( );
      return;
    }
    dispatch( { type: "START_SYNC" } );
    activateKeepAwake( );

    await downloadRemoteObservationsFromServer( );
    updateSyncTime( );
    deactivateKeepAwake( );
    resetUploadObservationsSlice( );
  }, [
    currentUser,
    downloadRemoteObservationsFromServer,
    isOnline,
    showInternetErrorAlert,
    toggleLoginSheet,
    updateSyncTime,
    uploadStatus,
    resetUploadObservationsSlice
  ] );

  const handleSyncButtonPress = useCallback( ( ) => {
    if ( numUnuploadedObservations > 0 ) {
      const uploadUuids = allUnsyncedObservations.map( o => o.uuid );
      const uuidsQuery = uploadUuids.map( uploadUuid => `'${uploadUuid}'` ).join( ", " );
      const uploads = realm.objects( "Observation" )
        .filtered( `uuid IN { ${uuidsQuery} }` );
      setTotalToolbarIncrements( uploads );
      addToUploadQueue( uploadUuids );
      startUpload( );
    } else {
      syncObservations( );
    }
  }, [
    addToUploadQueue,
    allUnsyncedObservations,
    startUpload,
    numUnuploadedObservations,
    realm,
    setTotalToolbarIncrements,
    syncObservations
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    startUpload( );
  }, [
    addToUploadQueue,
    addTotalToolbarIncrements,
    startUpload,
    realm
  ] );

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
      handleIndividualUploadPress={handleIndividualUploadPress}
      handleSyncButtonPress={handleSyncButtonPress}
      layout={layout}
      observations={observations}
      onEndReached={fetchNextPage}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      status={observationListStatus}
      syncInProgress={syncInProgress}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;
