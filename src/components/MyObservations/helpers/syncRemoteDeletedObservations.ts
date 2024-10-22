import {
  checkForDeletedObservations
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { format } from "date-fns";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { isDebugMode } from "sharedHooks/useDebugMode";
import { zustandStorage } from "stores/useStore";

const logger = log.extend( "syncRemoteDeletedObservations" );

const setParamsWithLastSyncTime = ( ) => {
  const lastDeletedSyncTime = zustandStorage.getItem( "lastDeletedSyncTime" );
  const deletedParams = { since: format( new Date( ), "yyyy-MM-dd" ) };
  if ( lastDeletedSyncTime ) {
    try {
      deletedParams.since = lastDeletedSyncTime;
    } catch ( lastSyncTimeFormatError ) {
      if ( lastSyncTimeFormatError instanceof RangeError ) {
        // If we can't parse that date, assume we've never synced and use the default
      } else {
        throw lastSyncTimeFormatError;
      }
    }
  }
  return deletedParams;
};

const deleteRemotelyDeletedObservations = ( deletedObservations, realm ) => {
  if ( !deletedObservations ) { return; }
  if ( deletedObservations?.length > 0 ) {
    safeRealmWrite( realm, ( ) => {
      const localObservationsToDelete = realm.objects( "Observation" )
        .filtered( `id IN { ${deletedObservations} }` );
      localObservationsToDelete.forEach( observation => {
        realm.delete( observation );
      } );
    }, "removing remotely deleted observations from realm" );
  }
};

// eslint-disable-next-line no-undef
export default syncRemoteDeletedObservations = async realm => {
  if ( isDebugMode( ) ) {
    logger.info( "syncRemoteDeletedObservations, calling getJWT" );
  }
  const apiToken = await getJWT( );
  const deletedParams = setParamsWithLastSyncTime( realm );
  const response = await checkForDeletedObservations( deletedParams, { api_token: apiToken } );
  const currentSyncTime = format( new Date( ), "yyyy-MM-dd" );
  zustandStorage.setItem( "lastDeletedSyncTime", currentSyncTime );
  const deletedObservations = response?.results;
  deleteRemotelyDeletedObservations( deletedObservations, realm );
};
