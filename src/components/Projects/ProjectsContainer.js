// @flow

import { searchProjects } from "api/projects";
import _ from "lodash";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useTranslation,
  useUserLocation
} from "sharedHooks";

import Projects from "./Projects";

const JOINED_TAB_ID = "JOINED";
const FEATURED_TAB_ID = "FEATURED";
const NEARBY_TAB_ID = "NEARBY";

const ProjectsContainer = ( ): Node => {
  const [searchInput, setSearchInput] = useState( "" );
  const currentUser = useCurrentUser( );
  const memberId = currentUser?.id;
  const { t } = useTranslation( );
  const [apiParams, setApiParams] = useState( { } );
  const [currentTabId, setCurrentTabId] = useState( JOINED_TAB_ID );
  const { latLng } = useUserLocation( { skipPlaceGuess: true } );

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
    if ( currentTabId === JOINED_TAB_ID ) {
      setApiParams( { member_id: memberId } );
    } else if ( currentTabId === FEATURED_TAB_ID ) {
      setApiParams( { featured: true } );
    } else if ( currentTabId === NEARBY_TAB_ID && latLng ) {
      setApiParams( {
        lat: latLng.latitude,
        lng: latLng.longitude
      } );
    }
  }, [
    memberId,
    currentTabId,
    latLng,
    searchInput
  ] );

  useEffect( ( ) => {
    if ( searchInput.length > 0 ) {
      setApiParams( { q: searchInput } );
    }
  }, [searchInput] );

  const tabs = [
    {
      id: JOINED_TAB_ID,
      text: t( "JOINED" ),
      onPress: () => {
        setCurrentTabId( JOINED_TAB_ID );
      }
    },
    {
      id: FEATURED_TAB_ID,
      text: t( "FEATURED" ),
      onPress: () => {
        setCurrentTabId( FEATURED_TAB_ID );
      }
    },
    {
      id: NEARBY_TAB_ID,
      text: t( "NEARBY" ),
      onPress: () => {
        setCurrentTabId( NEARBY_TAB_ID );
      }
    }
  ];

  if ( !currentUser ) {
    tabs.shift( );
  }

  return (
    <Projects
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      tabs={tabs}
      currentTabId={currentTabId}
      projects={projects}
      isLoading={isLoading}
      memberId={memberId}
    />
  );
};

export default ProjectsContainer;
