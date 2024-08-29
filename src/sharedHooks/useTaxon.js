// @flow

import { fetchTaxon } from "api/taxa";
import { RealmContext } from "providers/contexts.ts";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const ONE_WEEK_MS = (
  1000 // ms / s
  * 60 // s / min
  * 60 // min / hr
  * 24 // hr / day
  * 7 // day / wk
);

// $FlowIgnore
const useTaxon = ( taxon: Object, fetchRemote = true ): Object => {
  const realm = useRealm( );
  // taxon id is returned as a string, not a number, from CV model
  const taxonId = Number( taxon?.id );

  const localTaxon = taxonId && realm.objectForPrimaryKey( "Taxon", taxonId );

  const canFetchTaxon = !!taxonId;
  const outOfDate = localTaxon
    ? ( localTaxon._synced_at && ( Date.now( ) - localTaxon._synced_at > ONE_WEEK_MS ) )
    : false;
  const missingRequiredAttributes = localTaxon
    ? (
      !localTaxon.preferred_common_name
      || !localTaxon.default_photo?.url
    )
    : false;
  const localTaxonNeedsSync = (
    // Definitely sync if there's no local copy
    !localTaxon
    // Sync if the local copy hasn't been synced in a week
    || outOfDate
    // Sync if missing a common name or default photo from being saved in Realm while offline
    || missingRequiredAttributes
  );
  const enabled = !!( canFetchTaxon && fetchRemote && localTaxonNeedsSync );

  const {
    data: remoteTaxon,
    error,
    isLoading,
    refetch
  } = useAuthenticatedQuery(
    ["fetchTaxon", taxonId],
    optsWithAuth => fetchTaxon( taxonId, { fields: Taxon.LIMITED_TAXON_FIELDS }, optsWithAuth ),
    {
      enabled
    }
  );

  const mappedRemoteTaxon = remoteTaxon
    ? Taxon.mapApiToRealm( remoteTaxon, realm )
    : null;

  if ( localTaxonNeedsSync && mappedRemoteTaxon ) {
    safeRealmWrite( realm, ( ) => {
      realm.create(
        "Taxon",
        { ...mappedRemoteTaxon, _synced_at: new Date( ) },
        "modified"
      );
    }, "saving remote taxon in useTaxon" );
  }

  // Local is best, local-ish version of remote will be available sooner, use
  // whatever was passed in as a last resort
  return {
    error,
    refetch,
    taxon: localTaxon || mappedRemoteTaxon || taxon,
    // Apparently useQuery isLoading is true if the query is disabled
    isLoading: enabled && isLoading
  };
};

export default useTaxon;
