// @flow

import fetchSearchResults from "api/search";
import { RealmContext } from "providers/contexts.ts";
import {
  useCallback, useEffect
} from "react";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useTaxonSearch = ( taxonQuery: string ): Object => {
  const realm = useRealm( );
  const { data: taxaSearchResults, refetch, isLoading } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa",
        fields: {
          taxon: Taxon.LIMITED_TAXON_FIELDS
        }
      },
      optsWithAuth
    ),
    {
      enabled: !!( taxonQuery.length > 0 )
    }
  );

  const saveTaxaToRealm = useCallback( ( ) => {
    // we're already getting all this taxon information anytime we make this API
    // call, so we might as well store it in realm. we can remove this if
    // we're worried about the cache getting too large
    const mappedTaxa = taxaSearchResults?.map(
      result => Taxon.mapApiToRealm( result, realm )
    );
    safeRealmWrite( realm, ( ) => {
      mappedTaxa.forEach( remoteTaxon => {
        realm.create(
          "Taxon",
          { ...remoteTaxon, _synced_at: new Date( ) },
          "modified"
        );
      } );
    }, "saving remote taxon from useTaxonSearch" );
  }, [realm, taxaSearchResults] );

  useEffect( ( ) => {
    if ( taxaSearchResults?.length > 0 ) {
      saveTaxaToRealm( );
    }
  }, [saveTaxaToRealm, taxaSearchResults] );

  return { taxaSearchResults, refetch, isLoading };
};

export default useTaxonSearch;
