import { useNetInfo } from "@react-native-community/netinfo";
import {
  ActivityIndicator,
  Body2,
  OfflineNotice
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

interface Props {
  isLoading: boolean,
  searchQuery: string,
  refetch: Function
}

const EmptySearchResults = ( { isLoading, searchQuery, refetch }: Props ) => {
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );

  if ( searchQuery === "" ) {
    return null;
  }
  if ( isConnected === false ) {
    return (
      <View className="pt-[50px]">
        <OfflineNotice onPress={refetch} />
      </View>
    );
  }
  if ( isLoading ) {
    return (
      <View className="p-4">
        <ActivityIndicator size={40} />
      </View>
    );
  }
  return (
    <Body2 className="text-center pt-[50px]">{t( "No-results-found-for-that-search" )}</Body2>
  );
};

export default EmptySearchResults;
