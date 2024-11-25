// @flow

import {
  SearchBar,
  TaxaList,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useTaxonSearch, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

const TaxonSearch = ( ): Node => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const { taxaSearchResults, refetch, isLoading } = useTaxonSearch( taxonQuery );
  const { t } = useTranslation( );

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: false }
  );

  const renderTaxonResult = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      accessibilityLabel={t( "Choose-taxon" )}
      fetchRemote={false}
      first={index === 0}
      handleCheckmarkPress={() => setSelectedTaxon( taxon )}
      hideNavButtons
      taxon={taxon}
      testID={`Search.taxa.${taxon.id}`}
    />
  ), [setSelectedTaxon, t] );

  return (
    <ViewWrapper>
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
          autoFocus={taxonQuery === ""}
        />
      </View>
      <TaxaList
        taxa={taxaSearchResults}
        isLoading={isLoading}
        renderItem={renderTaxonResult}
        taxonQuery={taxonQuery}
        refetch={refetch}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
