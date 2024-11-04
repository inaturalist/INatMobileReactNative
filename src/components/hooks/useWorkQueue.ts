import { updateUsers } from "api/users";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import QueueItem from "realmModels/QueueItem.ts";
import {
  useAuthenticatedMutation
} from "sharedHooks";

const { useRealm } = RealmContext;

const useWorkQueue = ( ) => {
  const realm = useRealm( );
  const [isMutating, setIsMutating] = useState( false );

  const dequeuedItem = QueueItem.dequeue( realm );
  const id = dequeuedItem?.id || null;
  const payload = dequeuedItem?.payload || null;
  const type = dequeuedItem?.type || null;

  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        console.log(
          "updated user locale on server to: ",
          payload["user[locale]"]
        );
        QueueItem.deleteDequeuedItem( realm, id );
        setIsMutating( false );
      },
      onError: ( ) => {
        console.log( "error updating user locale in useChangeLocale" );
        setIsMutating( false );
      }
    }
  );

  useEffect( ( ) => {
    if ( !payload || isMutating ) { return; }
    if ( type === "locale-change" ) {
      setIsMutating( true );
      updateUserMutation.mutate( payload );
    }
  }, [payload, updateUserMutation, isMutating, type] );
};

export default useWorkQueue;