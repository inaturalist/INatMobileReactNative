import { searchProjects } from "api/projects";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useTranslation,
  useUserLocation
} from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";

import Projects from "./Projects";

export enum TAB_ID {
  // eslint-disable-next-line no-unused-vars
  JOINED = "JOINED",
  // eslint-disable-next-line no-unused-vars
  FEATURED = "FEATURED",
  // eslint-disable-next-line no-unused-vars
  NEARBY = "NEARBY"
}

const ProjectsContainer = ( ) => {
  const [searchInput, setSearchInput] = useState( "" );
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const { t } = useTranslation( );
  const [apiParams, setApiParams] = useState( { } );
  const [currentTabId, setCurrentTabId] = useState( TAB_ID.JOINED );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission();
  const { userLocation } = useUserLocation( {
    skipName: true,
    permissionsGranted: hasPermissions
  } );

  const {
    data: projects,
    isLoading
  } = useAuthenticatedQuery(
    ["searchProjects", apiParams],
    optsWithAuth => searchProjects( apiParams, optsWithAuth ),
    {
      enabled: !_.isEmpty( apiParams )
    }
  );

  useEffect( ( ) => {
    if ( currentTabId === TAB_ID.JOINED ) {
      setApiParams( { member_id: memberId } );
    } else if ( currentTabId === TAB_ID.FEATURED ) {
      setApiParams( { featured: true } );
    } else if ( currentTabId === TAB_ID.NEARBY && userLocation ) {
      setApiParams( {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      } );
    }
  }, [
    memberId,
    currentTabId,
    userLocation,
    searchInput
  ] );

  useEffect( ( ) => {
    if ( searchInput.length > 0 ) {
      setApiParams( { q: searchInput } );
    }
  }, [searchInput] );

  const tabs = [
    {
      id: TAB_ID.JOINED,
      text: t( "JOINED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.JOINED );
      }
    },
    {
      id: TAB_ID.FEATURED,
      text: t( "FEATURED" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.FEATURED );
      }
    },
    {
      id: TAB_ID.NEARBY,
      text: t( "NEARBY" ),
      onPress: () => {
        setCurrentTabId( TAB_ID.NEARBY );
      }
    }
  ];

  if ( !currentUser ) {
    tabs.shift( );
  }

  return (
    <>
      <Projects
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        tabs={tabs}
        currentTabId={currentTabId}
        projects={projects}
        isLoading={isLoading}
        memberId={memberId}
        hasPermissions={hasPermissions}
        requestPermissions={requestPermissions}
      />
      {renderPermissionsGate()}
      {/* <LocationPermissionGate
        permissionNeeded={currentTabId === NEARBY_TAB_ID}
        withoutNavigation
        onPermissionGranted={( ) => setPermissionsGranted( true )}
        onPermissionDenied={( ) => setPermissionsGranted( false )}
        onPermissionBlocked={( ) => setPermissionsGranted( false )}
      /> */}
    </>
  );
};

export default ProjectsContainer;
