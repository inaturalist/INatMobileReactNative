// @flow
import classNames from "classnames";
import AddObsButton from "components/AddObsModal/AddObsButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShadow } from "styles/global";

import NavButton from "./NavButton";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2,
  elevation: 20
} );

type Props = {
  tabs: Array<Object>,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { tabs }: Props ): Node => {
  const tabList = tabs.map( tab => <NavButton {...tab} key={tab.testID} /> );

  tabList.splice(
    -2,
    0,
    // Absolutely position the AddObsButton so it can float outside of the tab
    // bar
    (
      <View className="w-[69px] h-[60px] mx-3" key="CustomTabBar-AddObs">
        <View className="absolute top-[-13px]">
          <AddObsButton key="AddObsButton" />
        </View>
      </View>
    )
  );

  const insets = useSafeAreaInsets( );

  return (
    <View
      className={classNames(
        "flex-row bg-white justify-evenly p-1 m-0",
        { "pb-5": insets.bottom > 0 }
      )}
      style={DROP_SHADOW}
      accessibilityRole="tablist"
      testID="CustomTabBar"
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
