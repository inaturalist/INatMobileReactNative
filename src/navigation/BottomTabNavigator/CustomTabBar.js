// @flow
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { getCurrentRoute } from "navigation/navigationUtils";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

type Props = {
  tabs: Array<Object>,
};

/* eslint-disable react/jsx-props-no-spreading */

const HIDDEN_TAB_BAR_STYLE = {
  height: 0,
  opacity: 0
};

const CustomTabBar = ( { tabs }: Props ): Node => {
  const [tabBarHidden, setTabBarHidden] = useState( false );
  const { params } = getCurrentRoute( );
  const tabList = tabs.map( tab => <NavButton {...tab} key={tab.testID} /> );

  tabList.splice( -2, 0, <AddObsButton key="AddObsButton" /> );

  const insets = useSafeAreaInsets( );

  useEffect( ( ) => {
    if ( params?.tabBarHidden === true ) {
      // This solves the problem of the bar not really disappearing sometimes,
      // but at the cost of a delay
      // setTimeout( ( ) => setTabBarHidden( true ), 2100 );
      setTabBarHidden( true );
    } else if ( params?.tabBarHidden === false ) {
      setTabBarHidden( false );
    }
  }, [
    params?.tabBarHidden
  ] );

  const tabBarHiddenNow = params?.tabBarHidden || tabBarHidden;

  return (
    <View
      style={{
        ...tabBarHiddenNow
          ? HIDDEN_TAB_BAR_STYLE
          : {}
      }}
    >
      <View
        className={classNames(
          "flex-row bg-white justify-evenly items-center p-1 m-0",
          { "pb-5": insets.bottom > 0 }
        )}
        style={
          getShadowStyle( {
            shadowColor: colors.black,
            offsetWidth: 0,
            offsetHeight: -3,
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 20
          } )
        }
        accessibilityRole="tablist"
      >
        {tabList}
      </View>
    </View>
  );
};

export default CustomTabBar;
