// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, {
  useCallback, useState
} from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useLocalObservations,
  useObservationsUpdates,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_IN_PROGRESS
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import useClearGalleryPhotos from "./hooks/useClearGalleryPhotos";
import useClearRotatedOriginalPhotos from "./hooks/useClearRotatedOriginalPhotos";
import useClearSyncedMediaForUpload from "./hooks/useClearSyncedMediaForUpload";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const isFocused = useIsFocused( );
  // clear original, large-sized photos before a user returns to any of the Camera or AICamera flows
  useClearRotatedOriginalPhotos( );
  useClearGalleryPhotos( );
  useClearSyncedMediaForUpload( isFocused );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const uploadQueue = useStore( state => state.uploadQueue );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const syncingStatus = useStore( state => state.syncingStatus );
  const startManualSync = useStore( state => state.startManualSync );
  const startAutomaticSync = useStore( state => state.startAutomaticSync );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );

  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = currentUser && isConnected;

  const { startUploadObservations } = useUploadObservations( canUpload );
  useSyncObservations(
    currentUserId,
    startUploadObservations
  );

  useObservationsUpdates( !!currentUser );

  const {
    fetchNextPage,
    isFetchingNextPage,
    observations: data,
    status
  } = useInfiniteObservationsScroll( {
    upsert: syncingStatus === "sync-pending",
    params: {
      user_id: currentUserId
    }
  } );

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  const confirmInternetConnection = useCallback( ( ) => {
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return isConnected;
  }, [t, isConnected] );

  const confirmLoggedIn = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
    return currentUser;
  }, [currentUser] );

  const handleSyncButtonPress = useCallback( ( ) => {
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }

    startManualSync( );
  }, [
    startManualSync,
    confirmInternetConnection,
    confirmLoggedIn
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const uploadExists = uploadQueue.includes( uuid );
    if ( uploadExists ) {
      return;
    }
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    setUploadStatus( UPLOAD_IN_PROGRESS );
  }, [
    confirmLoggedIn,
    uploadQueue,
    confirmInternetConnection,
    realm,
    addTotalToolbarIncrements,
    addToUploadQueue,
    setUploadStatus
  ] );

  useFocusEffect(
    // need to reset the state on a FocusEffect, not a blur listener, because
    // tab bar screens don't seem to blur
    useCallback( ( ) => {
      const unsynced = Observation.filterUnsyncedObservations( realm );
      setNumUnuploadedObservations( unsynced.length );
      startAutomaticSync( );
    }, [
      startAutomaticSync,
      setNumUnuploadedObservations,
      realm
    ] )
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
      isConnected={isConnected}
      handleIndividualUploadPress={handleIndividualUploadPress}
      handleSyncButtonPress={handleSyncButtonPress}
      layout={layout}
      numUnuploadedObservations={numUnuploadedObservations}
      observations={observations}
      onEndReached={fetchNextPage}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      status={observationListStatus}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;
