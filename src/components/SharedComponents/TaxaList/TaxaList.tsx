import EmptySearchResults from "components/Explore/SearchScreens/EmptySearchResults.tsx";
import { View } from "components/styledComponents";
import React from "react";
import { FlatList } from "react-native";
import { useIconicTaxa } from "sharedHooks";

interface Props {
  isLoading: boolean;
  taxa: {
    id: string;
  }[];
  renderItem: () => React.JSX.Element;
  taxonQuery: string;
  refetch: () => void;
}

const TaxaList = ( {
  isLoading,
  taxa,
  renderItem,
  taxonQuery,
  refetch
}: Props ) => {
  // TODO: how to use Realm with TS
  const iconicTaxa = useIconicTaxa( { reload: false } );

  // 20240816 amanda - afaik we only want to seed the initial screen
  // with iconic taxon data, and we still want to be able to show the empty screen
  // and offline state when a user has typed in a query
  const data = taxonQuery === ""
    ? iconicTaxa
    : taxa;

  const renderEmptyList = ( ) => (
    <EmptySearchResults
      isLoading={isLoading}
      searchQuery={taxonQuery}
      refetch={refetch}
    />
  );

  const renderFooter = ( ) => <View className="h-[336px]" />;

  return (
    <FlatList
      keyboardShouldPersistTaps="always"
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ListEmptyComponent={renderEmptyList}
      ListFooterComponent={renderFooter}
    />
  );
};

export default TaxaList;
