// @flow

import { fetchObservationUpdates } from "api/observations";
import { RealmContext } from "providers/contexts";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

const { useRealm } = RealmContext;

const useObservationsUpdates = ( currentUser: Object ): Object => {
  const realm = useRealm();

  // Request params for fetching unviewed updates
  const baseParams = {
    observations_by: "owner",
    viewed: false,
    fields: "viewed,resource_uuid,comment_id,identification_id"
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useAuthenticatedQuery(
    ["fetchObservationUpdates"],
    optsWithAuth => fetchObservationUpdates( baseParams, optsWithAuth ),
    { enabled: !!currentUser }
  );

  if ( isError ) {
    console.log( "Error fetching observation updates", error );
    throw error;
  }
  /*
    Example data:
    data [
      {
        "id": 444891990,
        "identification_id": 351030378,
        "resource_uuid": "7875be1b-37aa-4db7-8dd3-12d8fd95641f",
        "viewed": false
      },
      {
        "comment_id": 11903880,
        "id": 444891374,
        "resource_uuid": "04000bd3-1911-46ca-b574-a9146a1f0924",
        "viewed": false
      },
      {
        "id": 444769999,
        "identification_id": 351012490,
        "resource_uuid": "92974209-f91c-4144-a237-9a4cdccba298",
        "viewed": false
      },
      {
        "comment_id": 11903367,
        "id": 444764480,
        "resource_uuid": "92974209-f91c-4144-a237-9a4cdccba298",
        "viewed": false
      }
    ]
  */

  // Looping through all unviewed updates
  const unviewed = data?.filter( result => result.viewed === false );
  unviewed?.forEach( update => {
    // Get the observation from local realm that matches the update's resource_uuid
    const existingObs = realm?.objectForPrimaryKey(
      "Observation",
      update.resource_uuid
    );
    if ( !existingObs ) {
      return;
    }
    // If both comments and identifications are already unviewed, nothing to do here
    if (
      existingObs.viewed_comments === false
      && existingObs.viewed_identifications === false
    ) {
      return;
    }
    // If the update is a comment, set the observation's viewed_comments to false
    if (
      existingObs.viewed_comments === true
      || existingObs.viewed_comments === null
    ) {
      if ( update.comment_id ) {
        realm?.write( () => {
          existingObs.viewed_comments = false;
        } );
      }
    }
    // If the update is an identification, set the observation's viewed_identifications to false
    if (
      existingObs.viewed_identifications === true
      || existingObs.viewed_identifications === null
    ) {
      if ( update.identification_id ) {
        realm?.write( () => {
          existingObs.viewed_identifications = false;
        } );
      }
    }
  } );

  return { refetch };
};

export default useObservationsUpdates;
