// @flow

import {
  ActivityIndicator,
  Body3,
  Heading4,
  INatIconButton,
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useIconicTaxa, useTranslation } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  hideInfoButton?: boolean,
  onPressInfo?: Function,
  updateTaxon: Function
};

const ExploreTaxonSearch = ( {
  closeModal,
  hideInfoButton,
  onPressInfo,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const [taxonQuery, setTaxonQuery] = useState( "" );

  const iconicTaxa = useIconicTaxa( { reload: false } );
  const { taxaSearchResults, isLoading } = useTaxonSearch( taxonQuery );

  const onTaxonSelected = useCallback( async newTaxon => {
    updateTaxon( newTaxon );
    closeModal();
  }, [closeModal, updateTaxon] );

  const resetTaxon = useCallback(
    ( ) => {
      updateTaxon( null );
      closeModal();
    },
    [updateTaxon, closeModal]
  );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      first={index === 0}
      handleTaxonOrEditPress={() => onTaxonSelected( taxon )}
      hideInfoButton={hideInfoButton}
      onPressInfo={onPressInfo}
      showCheckmark={false}
      taxon={taxon}
      testID={`Search.taxa.${taxon.id}`}
    />
  ), [
    hideInfoButton,
    onPressInfo,
    onTaxonSelected
  ] );

  let data = iconicTaxa;
  if ( taxonQuery.length > 0 ) {
    data = taxaSearchResults;
  }

  return (
    <ViewWrapper>
      <View className="flex-row justify-center p-5 bg-white">
        <INatIconButton
          testID="ExploreTaxonSearch.close"
          size={18}
          icon="back"
          className="absolute top-2 left-3 z-10"
          onPress={( ) => closeModal()}
          accessibilityLabel={t( "SEARCH-TAXA" )}
        />
        <Heading4>{t( "SEARCH-TAXA" )}</Heading4>
        <Body3 onPress={resetTaxon} className="absolute top-4 right-4">
          {t( "Reset-verb" )}
        </Body3>
      </View>
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
        />
      </View>
      {isLoading
        ? (
          <View className="p-4">
            <ActivityIndicator size={40} />
          </View>
        )
        : (
          <FlatList
            keyboardShouldPersistTaps="always"
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        )}
    </ViewWrapper>
  );
};

export default ExploreTaxonSearch;
