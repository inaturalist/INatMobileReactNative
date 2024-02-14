// @flow

import { useNavigation } from "@react-navigation/native";
import {
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useLayoutEffect, useRef, useState
} from "react";
import { FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import { useIconicTaxa } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const ExploreTaxonSearch = ( ): Node => {
  const theme = useTheme();
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const navigation = useNavigation( );
  // Ref for the input field
  const inputRef = useRef( null );
  // Focus input field on mount
  useLayoutEffect( ( ) => {
    inputRef.current?.focus();
  }, [] );

  const iconicTaxa = useIconicTaxa( { reload: false } );
  const taxonList = useTaxonSearch( taxonQuery );

  const onTaxonSelected = useCallback( async newTaxon => {
    navigation.navigate( "Explore", { taxon: newTaxon } );
  }, [navigation] );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      showCheckmark={false}
      handlePress={() => onTaxonSelected( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
    />
  ), [onTaxonSelected] );

  let data = iconicTaxa;
  if ( taxonQuery.length > 0 ) {
    data = taxonList;
  }

  return (
    <ViewWrapper className="flex-1">
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={getShadow( theme.colors.primary )}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
          input={inputRef}
        />
      </View>

      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </ViewWrapper>
  );
};

export default ExploreTaxonSearch;
