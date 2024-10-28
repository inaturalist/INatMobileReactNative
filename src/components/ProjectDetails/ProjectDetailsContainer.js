// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import {
  fetchMembership,
  fetchProjectMembers, fetchProjectPosts, fetchProjects, joinProject, leaveProject
} from "api/projects";
import type { Node } from "react";
import React, { useState } from "react";
import User from "realmModels/User.ts";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const logger = log.extend( "ProjectDetailsContainer" );

const DETAIL_FIELDS = {
  title: true,
  icon: true,
  project_type: true,
  icon_file_name: true,
  header_image_url: true,
  description: true,
  place_id: true,
  observation_count: true,
  species_count: true
};

const DETAIL_PARAMS = {
  fields: DETAIL_FIELDS
};

const ProjectDetailsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const currentUser = useCurrentUser( );
  const [loading, setLoading] = useState( false );

  const fetchProjectsQueryKey = ["projectDetails", "fetchProjects", id];

  const { data: project } = useAuthenticatedQuery(
    fetchProjectsQueryKey,
    optsWithAuth => fetchProjects( id, { ...DETAIL_PARAMS }, optsWithAuth )
  );

  const { data: projectMembers } = useAuthenticatedQuery(
    ["fetchProjectMembers", id],
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login",
      fields: {
        user: User.LIMITED_FIELDS
      }
    }, optsWithAuth )
  );

  const { data: projectPosts } = useAuthenticatedQuery(
    ["fetchProjectPosts", id],
    optsWithAuth => fetchProjectPosts( {
      id
    }, optsWithAuth )
  );

  const { data: projectStats } = useAuthenticatedQuery(
    ["searchObservations", id],
    ( ) => searchObservations( {
      project_id: id
    } )
  );

  const { data: speciesCounts } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", id],
    ( ) => fetchSpeciesCounts( {
      project_id: id
    } )
  );

  const membershipQueryKey = ["fetchMembership", id];

  const { data: currentMembership } = useAuthenticatedQuery(
    membershipQueryKey,
    optsWithAuth => fetchMembership( {
      id
    }, optsWithAuth ),
    {
      enabled: !!( currentUser )
    }
  );

  const queryClient = useQueryClient( );

  const createJoinProjectMutation = useAuthenticatedMutation(
    ( joinParams, optsWithAuth ) => joinProject( joinParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        logger.error( "could not join project: ", project.id, error );
      },
      onSettled: ( ) => setLoading( false )
    }
  );

  const createLeaveProjectMutation = useAuthenticatedMutation(
    ( leaveParams, optsWithAuth ) => leaveProject( leaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        logger.error( "could not leave project: ", project.id, error );
      },
      onSettled: ( ) => setLoading( false )
    }
  );

  const handleJoinProjectPress = ( ) => {
    if ( currentUser ) {
      setLoading( true );
      createJoinProjectMutation.mutate( { id } );
    } else {
      navigation.navigate( "LoginStackNavigator", {
        screen: "Login",
        params: {
          prevScreen: "ProjectDetails",
          projectId: project.id
        }
      } );
    }
  };

  if ( project ) {
    project.members_count = projectMembers?.total_results;
    project.journal_posts_count = projectPosts;
    project.observations_count = projectStats?.total_results;
    project.species_count = speciesCounts?.total_results;
    project.current_user_is_member = currentMembership === 1;
  }

  return (
    <ProjectDetails
      project={project}
      joinProject={handleJoinProjectPress}
      leaveProject={( ) => {
        setLoading( true );
        createLeaveProjectMutation.mutate( { id } );
      }}
      loadingProjectMembership={loading}
    />
  );
};

export default ProjectDetailsContainer;
