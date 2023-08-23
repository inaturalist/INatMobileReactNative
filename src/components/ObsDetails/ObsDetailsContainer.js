// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import createIdentification from "api/identifications";
import {
  fetchRemoteObservation,
  markObservationUpdatesViewed
} from "api/observations";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useEffect, useReducer
} from "react";
import { Alert, LogBox } from "react-native";
import Observation from "realmModels/Observation";
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
  useCurrentUser,
  useLocalObservation,
  useTranslation
} from "sharedHooks";
import useObservationsUpdates,
{ fetchObservationUpdatesKey } from "sharedHooks/useObservationsUpdates";

import ObsDetails from "./ObsDetails";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ACTIVITY_TAB_ID = "ACTIVITY";
const DETAILS_TAB_ID = "DETAILS";

const sortItems = ( ids, comments ) => ids.concat( [...comments] ).sort(
  ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) )
);

const initialState = {
  currentTabId: ACTIVITY_TAB_ID,
  addingActivityItem: false,
  showAgreeWithIdSheet: false,
  showCommentBox: false,
  observationShown: null,
  activityItems: []
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "SET_INITIAL_OBSERVATION":
      return {
        ...state,
        observationShown: action.observationShown,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case "CHANGE_TAB":
      return {
        ...state,
        currentTabId: action.currentTabId
      };
    case "ADD_ACTIVITY_ITEM":
      return {
        ...state,
        observationShown: action.observationShown,
        addingActivityItem: false,
        activityItems: sortItems(
          action.observationShown?.identifications || [],
          action.observationShown?.comments || []
        )
      };
    case "LOADING_ACTIVITY_ITEM":
      return {
        ...state,
        addingActivityItem: true
      };
    case "SHOW_AGREE_SHEET":
      return {
        ...state,
        showAgreeWithIdSheet: action.showAgreeWithIdSheet
      };
    case "SHOW_COMMENT_BOX":
      return {
        ...state,
        showCommentBox: action.showCommentBox
      };
    default:
      throw new Error( );
  }
};

const ObsDetailsContainer = ( ): Node => {
  const currentUser = useCurrentUser( );
  const { params } = useRoute();
  const { uuid } = params;
  const navigation = useNavigation( );
  const realm = useRealm( );
  const { t } = useTranslation( );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    currentTabId,
    addingActivityItem,
    showAgreeWithIdSheet,
    showCommentBox,
    observationShown,
    activityItems
  } = state;

  const queryClient = useQueryClient( );

  const { data: remoteObservation, refetch: refetchRemoteObservation }
  = useAuthenticatedQuery(
    ["fetchRemoteObservation", uuid],
    optsWithAuth => fetchRemoteObservation(
      uuid,
      {
        fields: Observation.FIELDS
      },
      optsWithAuth
    )
  );

  const localObservation = useLocalObservation( uuid );
  const observation = localObservation || remoteObservation;

  useEffect( ( ) => {
    if ( !observationShown ) {
      dispatch( {
        type: "SET_INITIAL_OBSERVATION",
        observationShown: observation
      } );
    }
  }, [observation, observationShown] );

  const tabs = [
    {
      id: ACTIVITY_TAB_ID,
      testID: "ObsDetails.ActivityTab",
      onPress: ( ) => dispatch( { type: "CHANGE_TAB", currentTabId: ACTIVITY_TAB_ID } ),
      text: t( "ACTIVITY" )
    },
    {
      id: DETAILS_TAB_ID,
      testID: "ObsDetails.DetailsTab",
      onPress: () => dispatch( { type: "CHANGE_TAB", currentTabId: DETAILS_TAB_ID } ),
      text: t( "DETAILS" )
    }
  ];

  const markViewedLocally = async () => {
    if ( !localObservation ) { return; }
    realm?.write( () => {
      // Flags if all comments and identifications have been viewed
      localObservation.comments_viewed = true;
      localObservation.identifications_viewed = true;
    } );
  };

  const { refetch: refetchObservationUpdates } = useObservationsUpdates(
    !!currentUser && !!observation
  );

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    {
      onSuccess: () => {
        markViewedLocally( );
        queryClient.invalidateQueries( ["fetchRemoteObservation", uuid] );
        queryClient.invalidateQueries( [fetchObservationUpdatesKey] );
        refetchRemoteObservation( );
        refetchObservationUpdates( );
      }
    }
  );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const openCommentBox = ( ) => dispatch( { type: "SHOW_COMMENT_BOX", showCommentBox: true } );

  const createCommentMutation = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => {
        realm?.write( ( ) => {
          const localComments = localObservation?.comments;
          const newComment = data[0];
          newComment.user = currentUser;
          const realmComment = realm?.create( "Comment", newComment );
          localComments.push( realmComment );
        } );
        const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
        dispatch( { type: "ADD_ACTIVITY_ITEM", observationShown: updatedLocalObservation } );
      },
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-comment", { error: e.message } );
        } else {
          error = t( "Couldnt-create-comment", { error: t( "Unknown-error" ) } );
        }
        showErrorAlert( error );
      }
    }
  );

  const onCommentAdded = commentBody => {
    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createCommentMutation.mutate( {
      comment: {
        body: commentBody,
        parent_id: uuid,
        parent_type: "Observation"
      }
    } );
  };

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        realm?.write( ( ) => {
          const localIdentifications = localObservation?.identifications;
          const newIdentification = data[0];
          newIdentification.user = currentUser;
          newIdentification.taxon = realm?.objectForPrimaryKey(
            "Taxon",
            newIdentification.taxon.id
          ) || newIdentification.taxon;
          const realmIdentification = realm?.create( "Identification", newIdentification );
          localIdentifications.push( realmIdentification );
        } );
        const updatedLocalObservation = realm.objectForPrimaryKey( "Observation", uuid );
        dispatch( { type: "ADD_ACTIVITY_ITEM", observationShown: updatedLocalObservation } );
      },
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          error = t( "Couldnt-create-identification-unknown-error" );
        }
        showErrorAlert( error );
      }
    }
  );

  useEffect( ( ) => {
    if (
      localObservation
      && localObservation.unviewed()
      && !markViewedMutation.isLoading
    ) {
      markViewedMutation.mutate( { id: uuid } );
    }
  }, [localObservation, markViewedMutation, uuid] );

  const navToAddID = ( ) => {
    navigation.navigate( "AddID", {
      clearSearch: true,
      observationUUID: uuid,
      createRemoteIdentification: true
    } );
  };

  const showActivityTab = currentTabId === ACTIVITY_TAB_ID;

  const refetchObservation = ( ) => {
    queryClient.invalidateQueries( ["fetchRemoteObservation"] );
    refetchRemoteObservation( );
    refetchObservationUpdates( );
  };

  const onAgree = comment => {
    const agreeParams = {
      observation_id: observation?.uuid,
      taxon_id: observation?.taxon?.id,
      body: comment
    };

    dispatch( { type: "LOADING_ACTIVITY_ITEM" } );
    createIdentificationMutation.mutate( { identification: agreeParams } );
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: false } );
  };

  const agreeIdSheetDiscardChanges = ( ) => {
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: false } );
  };

  const onIDAgreePressed = ( ) => {
    dispatch( { type: "SHOW_AGREE_SHEET", showAgreeWithIdSheet: true } );
  };

  if ( !observation ) {
    return null;
  }

  return (
    <ObsDetails
      navToAddID={navToAddID}
      onCommentAdded={onCommentAdded}
      openCommentBox={openCommentBox}
      tabs={tabs}
      currentTabId={currentTabId}
      showCommentBox={showCommentBox}
      addingActivityItem={addingActivityItem}
      observation={observation}
      refetchRemoteObservation={refetchObservation}
      activityItems={activityItems}
      showActivityTab={showActivityTab}
      showAgreeWithIdSheet={showAgreeWithIdSheet}
      agreeIdSheetDiscardChanges={agreeIdSheetDiscardChanges}
      onAgree={onAgree}
      onIDAgreePressed={onIDAgreePressed}
      hideCommentBox={( ) => dispatch( { type: "SHOW_COMMENT_BOX", showCommentBox: false } )}
    />
  );
};

export default ObsDetailsContainer;
