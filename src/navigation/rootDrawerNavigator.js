// @flow

import { createDrawerNavigator } from "@react-navigation/drawer";
import About from "components/About";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import UiLibrary from "components/UiLibrary";
import { t } from "i18next";
import {
  hideDrawerHeaderLeft, hideHeader,
  showHeader
} from "navigation/navigationOptions";
import AddObsStackNavigator from "navigation/StackNavigators/AddObsStackNavigator";
import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import type { Node } from "react";
import * as React from "react";

import BottomTabNavigator from "./BottomTabNavigator";
import CustomDrawerContent from "./CustomDrawerContent";

const drawerOptions = {
  ...showHeader,
  drawerType: "front",
  drawerStyle: {
    backgroundColor: "transparent"
  }
};

const Drawer = createDrawerNavigator( );

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent
    state={state}
    navigation={navigation}
    descriptors={descriptors}
  />
);

const RootDrawerNavigator = ( ): Node => (
  <Drawer.Navigator
    screenOptions={drawerOptions}
    name="Drawer"
    drawerContent={drawerRenderer}
  >
    <Drawer.Screen
      name="TabNavigator"
      component={BottomTabNavigator}
      options={{
        ...hideHeader,
        ...hideDrawerHeaderLeft
      }}
    />
    <Drawer.Screen
      name="LoginNavigator"
      component={LoginStackNavigator}
      options={{
        ...hideHeader,
        ...hideDrawerHeaderLeft
      }}
    />
    <Drawer.Screen
      name="CameraNavigator"
      component={AddObsStackNavigator}
      options={{
        ...hideHeader,
        ...hideDrawerHeaderLeft
      }}
    />
    <Drawer.Screen
      name="search"
      component={Search}
      options={{
        ...showHeader,
        headerTitle: t( "Search" )
      }}
    />
    <Drawer.Screen
      name="settings"
      component={Settings}
      options={{ headerTitle: t( "Settings" ) }}
    />
    <Drawer.Screen
      name="about"
      component={About}
      options={{ headerTitle: t( "About-iNaturalist" ) }}
    />
    <Drawer.Screen
      name="help"
      component={PlaceholderComponent}
    />
    <Drawer.Screen
      name="network"
      component={NetworkLogging}
    />
    <Drawer.Screen
      name="UI Library"
      component={UiLibrary}
    />
    <Drawer.Screen
      name="Help"
      component={PlaceholderComponent}
    />
    <Drawer.Screen
      name="Blog"
      component={PlaceholderComponent}
    />
    <Drawer.Screen
      name="Donate"
      component={PlaceholderComponent}
    />
  </Drawer.Navigator>
);

export default RootDrawerNavigator;
