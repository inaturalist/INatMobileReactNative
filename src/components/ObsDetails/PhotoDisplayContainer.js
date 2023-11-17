// @flow
import {
  faveObservation,
  unfaveObservation
} from "api/observations";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useCallback, useMemo,
  useState
} from "react";
import { Alert } from "react-native";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useTranslation
} from "sharedHooks";

import PhotoDisplay from "./PhotoDisplay";

type Props = {
  observation: Object,
  refetchRemoteObservation: Function,
  isOnline: boolean
}

const PhotoDisplayContainer = ( {
  observation, refetchRemoteObservation, isOnline
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const { t } = useTranslation( );

  const faves = observation?.faves;
  const uuid = observation?.uuid;

  const currentUserFaved = useCallback( ( ) => {
    if ( faves?.length > 0 ) {
      const userFaved = faves.find( fave => fave.user_id === userId );
      return !!userFaved;
    }
    return null;
  }, [faves, userId] );

  const [userFav, setUserFav] = useState( currentUserFaved( ) || false );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const createUnfaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => unfaveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => refetchRemoteObservation( ),
      onError: error => {
        showErrorAlert( error );
        setUserFav( true );
      }
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => refetchRemoteObservation( ),
      onError: error => {
        showErrorAlert( error );
        setUserFav( false );
      }
    }
  );

  const faveOrUnfave = useCallback( ( ) => {
    if ( userFav ) {
      setUserFav( false );
      createUnfaveMutation.mutate( { uuid } );
    } else {
      setUserFav( true );
      createFaveMutation.mutate( { uuid } );
    }
  }, [createFaveMutation, createUnfaveMutation, userFav, uuid] );

  const observationPhotos = useMemo(
    ( ) => observation?.observationPhotos || observation?.observation_photos || [],
    [observation]
  );
  const photos = useMemo(
    ( ) => _.compact( Array.from( observationPhotos ).map( op => op.photo ) ),
    [observationPhotos]
  );

  return (
    <PhotoDisplay
      faveOrUnfave={faveOrUnfave}
      userFav={userFav}
      photos={photos}
      uuid={uuid}
      isOnline={isOnline}
    />
  );
};

export default PhotoDisplayContainer;
