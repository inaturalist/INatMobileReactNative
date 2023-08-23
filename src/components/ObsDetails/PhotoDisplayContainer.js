// @flow
import {
  faveObservation,
  unfaveObservation
} from "api/observations";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useCallback, useState
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
  refetchRemoteObservation: Function
}

const PhotoDisplayContainer = ( { observation, refetchRemoteObservation }: Props ): Node => {
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
      onSuccess: ( ) => {
        refetchRemoteObservation( );
        setUserFav( false );
      },
      onError: error => showErrorAlert( error )
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        refetchRemoteObservation( );
        setUserFav( true );
      },
      onError: error => showErrorAlert( error )
    }
  );

  const faveOrUnfave = ( ) => {
    if ( userFav ) {
      createUnfaveMutation.mutate( { uuid } );
    } else {
      createFaveMutation.mutate( { uuid } );
    }
  };

  const observationPhotos = observation?.observationPhotos || observation?.observation_photos || [];
  const photos = _.compact( Array.from( observationPhotos ).map( op => op.photo ) );

  return (
    <PhotoDisplay
      faveOrUnfave={faveOrUnfave}
      userFav={userFav}
      photos={photos}
      uuid={uuid}
    />
  );
};

export default PhotoDisplayContainer;
