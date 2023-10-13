// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreContainer from "components/Explore/ExploreContainer";
import Identify from "components/Identify/Identify";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import PlaceholderComponent from "components/PlaceholderComponent";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder,
  showHeaderLeft,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const Stack = createNativeStackNavigator( );

const ObservationsStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black"
    }}
  >
    <Stack.Group>
      <Stack.Screen
        name="ObsList"
        component={MyObservationsContainer}
        options={{
          ...hideHeader
        }}
      />
      <Stack.Screen
        name="ObsDetails"
        component={ObsDetailsContainer}
        options={{
          headerTitle: t( "Observation" ),
          headerShown: false,
          unmountOnBlur: true
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          ...showHeaderLeft,
          ...blankHeaderTitle,
          ...removeBottomBorder
        }}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={DataQualityAssessment}
        options={{
          ...showLongHeader,
          headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
          unmountOnBlur: true
        }}
      />
    </Stack.Group>
    {SharedStackScreens( )}
    <Stack.Group>
      <Stack.Screen
        name="Explore"
        component={ExploreContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreFilters"
        component={PlaceholderComponent}
        options={{
          ...showHeaderLeft,
          ...removeBottomBorder
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="Identify"
      component={Identify}
      options={{
        ...removeBottomBorder,
        ...showHeaderLeft,
        headerTitle: t( "Identify" )
      }}
    />
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
