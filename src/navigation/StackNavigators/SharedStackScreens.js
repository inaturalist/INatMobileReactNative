// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MediaViewer from "components/MediaViewer/MediaViewer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { Heading4, Mortal, PermissionGate } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";
import { PermissionsAndroid } from "react-native";

const suggestionsTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;
const taxonSearchTitle = ( ) => <Heading4>{t( "SEARCH" )}</Heading4>;

const Stack = createNativeStackNavigator( );

const ObsEditWithPermission = ( ) => (
  <Mortal>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const MortalSuggestions = ( { route } ) => (
  <Mortal>
    <SuggestionsContainer route={route} />
  </Mortal>
);

const SharedStackScreens = ( ): Node => (
  <Stack.Group>
    <Stack.Screen
      name="ObsEdit"
      component={ObsEditWithPermission}
      options={{
        ...removeBottomBorder,
        ...blankHeaderTitle,
        headerBackVisible: false,
        headerTitleAlign: "center"
      }}
    />
    <Stack.Screen
      name="Suggestions"
      component={MortalSuggestions}
      options={{
        ...removeBottomBorder,
        headerTitle: suggestionsTitle,
        headerTitleAlign: "center",
        headerBackTitleVisible: false
      }}
    />
    <Stack.Screen
      name="TaxonSearch"
      component={TaxonSearch}
      options={{
        ...removeBottomBorder,
        headerTitle: taxonSearchTitle,
        headerTitleAlign: "center"
      }}
    />
    <Stack.Screen
      name="LocationPicker"
      component={LocationPickerContainer}
      options={hideHeader}
    />
    <Stack.Screen
      name="MediaViewer"
      component={MediaViewer}
      options={{
        ...blankHeaderTitle,
        headerTitleAlign: "center",
        headerTintColor: "white",
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: "black"
        }
      }}
    />
  </Stack.Group>
);

export default SharedStackScreens;
