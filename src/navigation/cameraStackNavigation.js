// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { HeaderBackButton } from "@react-navigation/elements";

import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import GroupPhotos from "../components/PhotoLibrary/GroupPhotos";
import ObsEdit from "../components/ObsEdit/ObsEdit";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const hideHeader = {
  headerShown: false
};

const CameraStackNavigation = ( ): React.Node => (
  <PhotoGalleryProvider>
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGallery}
        options={hideHeader}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotos}
        options={hideHeader}
      />
      <Stack.Screen
        name="ObsEdit"
        component={ObsEdit}
      />
    </Stack.Navigator>
  </PhotoGalleryProvider>
);

export default CameraStackNavigation;
