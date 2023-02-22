// @flow
import ObsGridItem from "components/Observations/ObsGridItem";
import ObsListHeader from "components/Observations/ObsListHeader";
import ObsListItem from "components/Observations/ObsListItem";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Dimensions, Pressable } from "react-native";

import MyObservationsEmpty from "./MyObservationsEmpty";

const { diffClamp } = Animated;

type Props = {
  currentUser: Object,
  isLoading?: bool,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  setLayout: Function,
  navToObsDetails: Function
}

const {
  width: screenWidth,
  height: screenHeight
} = Dimensions.get( "screen" );
const GUTTER = 5;
const HEADER_HEIGHT = 101;

const MyObservations = ( {
  currentUser,
  isLoading,
  layout,
  navToObsDetails,
  observations,
  onEndReached,
  setLayout
}: Props ): Node => {
  const { t } = useTranslation( );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, HEADER_HEIGHT );

  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, HEADER_HEIGHT],
    // $FlowIgnore
    outputRange: [0, -HEADER_HEIGHT]
  } );

  const numColumns = layout === "grid" ? 2 : 1;
  const combinedGutterWidth = ( numColumns + 1 ) * GUTTER;
  const gridItemWidth = Math.round( ( screenWidth - combinedGutterWidth ) / numColumns );

  return (
    <ViewWithFooter>
      <Animated.View style={[{ transform: [{ translateY: offsetForHeader }] }]}>
        <Animated.FlatList
          data={observations}
          key={layout === "grid" ? 1 : 0}
          style={{ height: screenHeight }}
          testID="MyObservations"
          numColumns={numColumns}
          renderItem={( { item } ) => (
            <Pressable
              onPress={() => navToObsDetails( item )}
              accessibilityRole="link"
              accessibilityHint={t( "Navigate-to-observation-details" )}
              accessibilityLabel={t( "Observation-Name", {
                scientificName: item.name
              } )}
            >
              {
                layout === "grid"
                  // TODO: this doesn't actually work, I think b/c this style
                  // needs to be static; haven't come up with a good way
                  // around that, though. Maybe we can punt on it until
                  // dealing with different screen sizes ~~~kueda 20230222
                  ? <ObsGridItem observation={item} width={`w-[${gridItemWidth}px]`} />
                  : <ObsListItem observation={item} />
              }
            </Pressable>
          )}
          ListEmptyComponent={
            <MyObservationsEmpty currentUser={currentUser} isLoading={isLoading} />
          }
          ListHeaderComponent={
            <ObsListHeader setLayout={setLayout} layout={layout} />
          }
          // ItemSeparatorComponent={layout !== "grid" && renderItemSeparator}
          stickyHeaderIndices={[0]}
          bounces={false}
          initialNumToRender={10}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
        />
      </Animated.View>
    </ViewWithFooter>
  );
};

export default MyObservations;
