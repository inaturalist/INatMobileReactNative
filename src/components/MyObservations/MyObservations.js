// @flow
import Header from "components/MyObservations/Header";
import { ObservationsFlashList, StickyView, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Animated, Platform } from "react-native";

import LoginSheet from "./LoginSheet";
import MyObservationsEmpty from "./MyObservationsEmpty";

type Props = {
  isFetchingNextPage?: boolean,
  layout: "list" | "grid",
  observations: Array<Object>,
  onEndReached: Function,
  toggleLayout: Function,
  allObsToUpload: Array<Object>,
  currentUser: ?Object,
  showLoginSheet: boolean,
  setShowLoginSheet: Function,
};

const MyObservations = ( {
  isFetchingNextPage,
  layout,
  observations,
  onEndReached,
  toggleLayout,
  allObsToUpload,
  currentUser,
  showLoginSheet,
  setShowLoginSheet
}: Props ): Node => {
  const [heightAboveToolbar, setHeightAboveToolbar] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  const renderEmptyList = ( ) => <MyObservationsEmpty isFetchingNextPage={isFetchingNextPage} />;

  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current }
        }
      }
    ],
    {
      listener: ( { nativeEvent } ) => {
        const { y } = nativeEvent.contentOffset;
        const hide = yValue < y;
        // there's likely a better way to do this, but for now fading out
        // the content that goes under the status bar / safe area notch on iOS
        if ( Platform.OS !== "ios" ) { return; }
        if ( hide !== hideHeaderCard ) {
          setHideHeaderCard( hide );
          setYValue( y );
        }
      },
      useNativeDriver: true
    }
  );

  return (
    <>
      <ViewWrapper>
        <View className="overflow-hidden">
          <StickyView scrollY={scrollY} heightAboveView={heightAboveToolbar}>
            <Header
              toggleLayout={toggleLayout}
              layout={layout}
              currentUser={currentUser}
              numObservations={observations.length}
              setHeightAboveToolbar={setHeightAboveToolbar}
              allObsToUpload={allObsToUpload}
              setShowLoginSheet={setShowLoginSheet}
            />
            <ObservationsFlashList
              isFetchingNextPage={isFetchingNextPage}
              layout={layout}
              onEndReached={onEndReached}
              allObsToUpload={allObsToUpload}
              currentUser={currentUser}
              testID="MyObservationsAnimatedList"
              handleScroll={handleScroll}
              renderEmptyList={renderEmptyList}
              data={observations.filter( o => o.isValid() )}
              showObservationsEmptyScreen
            />
          </StickyView>
        </View>
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
