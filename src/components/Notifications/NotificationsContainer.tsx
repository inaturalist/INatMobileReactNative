import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { ApiObservationsUpdatesParams } from "api/types";
import NotificationsList from "components/Notifications/NotificationsList.tsx";
import React, { useEffect, useState } from "react";
import { log } from "sharedHelpers/logger";
import { useInfiniteNotificationsScroll, usePerformance } from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "NotificationsContainer" );

interface Props {
  notificationParams: ApiObservationsUpdatesParams;
  onRefresh?: ( ) => void;
}

const NotificationsContainer = ( {
  notificationParams,
  onRefresh: onRefreshProp
}: Props ) => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const [refreshing, setRefreshing] = useState( false );

  const {
    fetchNextPage,
    isError,
    isFetching,
    isInitialLoading,
    notifications,
    refetch
  } = useInfiniteNotificationsScroll( notificationParams );

  const { loadTime } = usePerformance( {
    isLoading: isInitialLoading
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      if ( isConnected ) {
        refetch();
      }
    } );
  }, [isConnected, navigation, refetch] );

  const onRefresh = async () => {
    setRefreshing( true );
    await refetch();
    if ( typeof ( onRefreshProp ) === "function" ) onRefreshProp( );
    setRefreshing( false );
  };

  return (
    <NotificationsList
      data={notifications}
      isError={isError}
      isFetching={isFetching}
      isInitialLoading={isInitialLoading}
      isConnected={isConnected}
      onEndReached={fetchNextPage}
      reload={refetch}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default NotificationsContainer;
