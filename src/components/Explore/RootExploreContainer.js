// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import { useCurrentUser } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useExploreHeaderCount from "./hooks/useExploreHeaderCount";

const RootExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const rootExploreView = useStore( state => state.rootExploreView );
  const setRootExploreView = useStore( state => state.setRootExploreView );
  const rootStoredParams = useStore( state => state.rootStoredParams );
  const setRootStoredParams = useStore( state => state.setRootStoredParams );
  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions,
    hasBlockedPermissions: hasBlockedLocationPermissions
  } = useLocationPermission( );

  const {
    state, dispatch, makeSnapshot, defaultExploreLocation
  } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  const updateLocation = useCallback( async ( place: Object ) => {
    if ( place === "worldwide" ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null
      } );
    } else if ( place === "nearby" ) {
      const exploreLocation = await defaultExploreLocation( );
      // exploreLocation has a placeMode already
      // dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation
      } );
    } else {
      navigation.setParams( { place } );
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place,
        placeId: place?.id,
        placeGuess: place?.display_name
      } );
    }
  }, [defaultExploreLocation, dispatch, navigation] );

  // Object | null
  const updateUser = ( user: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_USER,
      user,
      userId: user?.id
    } );
  };

  const updateProject = ( project: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_PROJECT,
      project,
      projectId: project?.id
    } );
  };

  const filteredParams = mapParamsToAPI(
    state,
    currentUser
  );

  const queryParams = {
    ...filteredParams,
    per_page: 20
  };

  // need this hook to be top-level enough that ExploreHeaderCount rerenders
  const { count, loadingStatus, updateCount } = useExploreHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( rootStoredParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: rootStoredParams } );
      }
    } );

    navigation.addListener( "blur", ( ) => {
      setRootStoredParams( state );
    } );
  }, [navigation, setRootStoredParams, state, dispatch, rootStoredParams] );

  useEffect( () => {
    if ( hasBlockedLocationPermissions ) {
      updateLocation( "worldwide" );
    }
  }, [hasBlockedLocationPermissions, updateLocation] );

  return (
    <>
      <Explore
        closeFiltersModal={closeFiltersModal}
        count={count}
        hideBackButton
        filterByIconicTaxonUnknown={
          () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
        }
        currentExploreView={rootExploreView}
        setCurrentExploreView={setRootExploreView}
        isConnected={isConnected}
        loadingStatus={loadingStatus}
        openFiltersModal={openFiltersModal}
        queryParams={queryParams}
        showFiltersModal={showFiltersModal}
        updateCount={updateCount}
        updateTaxon={taxon => dispatch( { type: EXPLORE_ACTION.CHANGE_TAXON, taxon } )}
        updateLocation={updateLocation}
        updateUser={updateUser}
        updateProject={updateProject}
        placeMode={state.placeMode}
        hasLocationPermissions={hasLocationPermissions}
        requestLocationPermissions={requestLocationPermissions}
      />
      {renderPermissionsGate( { onPermissionGranted: () => updateLocation( "nearby" ) } )}
    </>
  );
};

const RootExploreContainer = (): Node => (
  <ExploreProvider>
    <RootExploreContainerWithContext />
  </ExploreProvider>
);

export default RootExploreContainer;
