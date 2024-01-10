// @flow
import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import MyObservationsEmpty from "components/MyObservations/MyObservationsEmpty";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useMemo
} from "react";
import { ActivityIndicator, Animated } from "react-native";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation, useTranslation } from "sharedHooks";

import ObsItem from "./ObsItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  currentUser?: Object,
  data: Array<Object>,
  explore: boolean,
  handleScroll?: Function,
  hideLoadingWheel: boolean,
  isFetchingNextPage?: boolean,
  isOnline: boolean,
  layout: "list" | "grid",
  onEndReached: Function,
  renderHeader?: Function,
  showObservationsEmptyScreen?: boolean,
  status?: string,
  testID: string,
  uploadSingleObservation?: Function,
  uploadState: Object
};

const GUTTER = 15;

const ObservationsFlashList = ( {
  currentUser,
  data,
  explore,
  handleScroll,
  hideLoadingWheel,
  isFetchingNextPage,
  isOnline,
  layout,
  onEndReached,
  renderHeader,
  showObservationsEmptyScreen,
  status,
  testID,
  uploadSingleObservation,
  uploadState
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const { t } = useTranslation( );

  const calculateGridItemWidth = columns => {
    const combinedGutter = ( columns + 1 ) * GUTTER;
    const gridWidth = isTablet
      ? screenWidth
      : Math.min( screenWidth, screenHeight );
    return Math.floor(
      ( gridWidth - combinedGutter ) / columns
    );
  };

  const calculateNumColumns = ( ) => {
    if ( layout === "list" || screenWidth <= BREAKPOINTS.md ) {
      return 1;
    }
    if ( !isTablet ) return 2;
    if ( isLandscapeMode ) return 6;
    if ( screenWidth <= BREAKPOINTS.xl ) return 2;
    return 4;
  };

  const numColumns = calculateNumColumns( );
  const gridItemWidth = calculateGridItemWidth( numColumns );

  const renderItem = useCallback( ( { item } ) => (
    <ObsItem
      observation={item}
      layout={layout}
      gridItemWidth={gridItemWidth}
      uploadSingleObservation={uploadSingleObservation}
      uploadState={uploadState}
      explore={explore}
    />
  ), [gridItemWidth, explore, layout, uploadState, uploadSingleObservation] );

  const renderItemSeparator = useCallback( ( ) => {
    if ( layout === "grid" ) {
      return null;
    }
    return <View className="border-b border-lightGray" />;
  }, [layout] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={hideLoadingWheel}
      layout={layout}
      isOnline={isOnline}
      explore={explore}
    />
  ), [hideLoadingWheel, layout, isOnline, explore] );

  const contentContainerStyle = useMemo( ( ) => {
    if ( layout === "list" ) { return {}; }
    return {
      paddingLeft: GUTTER / 2,
      paddingRight: GUTTER / 2
    };
  }, [layout] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = showObservationsEmptyScreen
      ? <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />
      : <Body3 className="self-center mt-[150px]">{t( "No-results-found" )}</Body3>;

    console.log( data?.length, status, "observations" );
    return ( ( status === "success" && currentUser ) || !currentUser )
      ? showEmptyScreen
      : (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size="large" testID="ObservationsFlashList.loading" />
        </View>
      );
  }, [
    currentUser,
    data,
    isFetchingNextPage,
    showObservationsEmptyScreen,
    status,
    t
  ] );

  const estimatedItemSize = layout === "grid"
    ? gridItemWidth
    : 98;

  if ( numColumns === 0 ) { return null; }

  return (
    <AnimatedFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={renderHeader}
      accessible
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedItemSize}
      horizontal={false}
      initialNumToRender={5}
      key={layout}
      // only used id as a fallback key because after upload
      // react thinks we've rendered a second item w/ a duplicate key
      keyExtractor={item => item.uuid || item.id}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      onScroll={handleScroll}
      refreshing={isFetchingNextPage}
      renderItem={renderItem}
      testID={testID}
    />
  );
};

export default ObservationsFlashList;
