// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import {
  SCREEN_NAME_NOTIFICATIONS,
  SCREEN_NAME_OBS_LIST,
  SCREEN_NAME_ROOT_EXPLORE
} from "navigation/StackNavigators/TabStackNavigator";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import User from "realmModels/User.ts";
import { useCurrentUser, useTranslation } from "sharedHooks";

import CustomTabBar from "./CustomTabBar";

const DRAWER_ID = "OPEN_DRAWER";

type Props = {
  navigation: Object
};

const tabIDByRoute = {
  [SCREEN_NAME_NOTIFICATIONS]: SCREEN_NAME_NOTIFICATIONS,
  [SCREEN_NAME_OBS_LIST]: SCREEN_NAME_OBS_LIST,
  [SCREEN_NAME_ROOT_EXPLORE]: SCREEN_NAME_ROOT_EXPLORE
};

const CustomTabBarContainer = ( { navigation }: Props ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const [activeTab, setActiveTab] = useState( SCREEN_NAME_OBS_LIST );
  const isDrawerOpen = useDrawerStatus() === "open";
  const route = getCurrentRoute();
  const currentRoute = route?.name || "";
  const currentActiveTab = tabIDByRoute[currentRoute] || activeTab;

  // Update activeTab only if it has changed to a different tab
  if ( currentActiveTab !== activeTab ) {
    setActiveTab( currentActiveTab );
  }

  const tabs = useMemo( ( ) => ( [
    {
      icon: "hamburger-menu",
      testID: DRAWER_ID,
      accessibilityLabel: t( "Menu" ),
      accessibilityHint: t( "Opens-the-side-drawer-menu" ),
      size: 32,
      onPress: ( ) => {
        navigation.openDrawer( );
      },
      active: isDrawerOpen
    },
    {
      icon: "compass-rose-outline",
      testID: SCREEN_NAME_ROOT_EXPLORE,
      accessibilityLabel: t( "Explore" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "RootExplore" );
      },
      active: SCREEN_NAME_ROOT_EXPLORE === activeTab
    },
    {
      icon: "person",
      userIconUri: User.uri( currentUser ),
      testID: "NavButton.personIcon",
      accessibilityLabel: t( "My-Observations--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-your-observations" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "ObsList" );
      },
      active: SCREEN_NAME_OBS_LIST === activeTab
    },
    {
      icon: "notifications-bell",
      testID: SCREEN_NAME_NOTIFICATIONS,
      accessibilityLabel: t( "Notifications--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-notifications" ),
      size: 32,
      onPress: ( ) => {
        navigation.navigate( "Notifications" );
      },
      active: SCREEN_NAME_NOTIFICATIONS === activeTab
    }
  ] ), [
    activeTab,
    currentUser,
    isDrawerOpen,
    navigation,
    t
  ] );

  return (
    <CustomTabBar
      tabs={tabs}
    />
  );
};

export default CustomTabBarContainer;
