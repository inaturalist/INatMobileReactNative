import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import NetworkLogging from "components/NetworkLogging";
import UiLibrary from "components/UiLibrary";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const DeveloperStackNavigator = ( ): Node => (
  <Stack.Navigator>
    <Stack.Screen
      name="developer"
      label="Developer"
      component={Developer}
    />
    <Stack.Screen
      name="network"
      component={NetworkLogging}
    />
    <Stack.Screen
      name="UILibrary"
      label="UI Library"
      component={UiLibrary}
    />
    <Stack.Screen
      name="log"
      component={Log}
    />
  </Stack.Navigator>
);

export default DeveloperStackNavigator;
