// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraContainer from "components/Camera/CameraContainer.tsx";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import { Heading4 } from "components/SharedComponents";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGateContainer, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS,
  READ_WRITE_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer.tsx";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import {
  hideHeader,
  hideHeaderLeft,
  showCustomHeader,
  showHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const Stack = createNativeStackNavigator( );

const soundRecorderTitle = ( ) => (
  <Heading4 className="text-white">{t( "RECORD-NEW-SOUND" )}</Heading4>
);

const CAMERA_SCREEN_OPTIONS = {
  ...hideHeader,
  orientation: "all",
  contentStyle: {
    backgroundColor: "black"
  }
};

const GROUP_PHOTOS_OPTIONS = {
  ...showHeader,
  ...showCustomHeader,
  lazy: true,
  headerShadowVisible: false
};

const SOUND_RECORDER_OPTIONS = {
  ...hideHeaderLeft,
  headerStyle: {
    backgroundColor: "black"
  },
  headerTintColor: "white",
  headerTitle: soundRecorderTitle,
  headerTitleAlign: "center"
};

const CameraContainerWithPermission = ( ) => (
  <Mortal>
    <PermissionGateContainer
      permissions={CAMERA_PERMISSIONS}
      title={t( "Observe-and-identify-organisms-in-real-time-with-your-camera" )}
      titleDenied={t( "Please-allow-Camera-Access" )}
      body={t( "Use-the-iNaturalist-camera-to-observe" )}
      blockedPrompt={t( "Youve-previously-denied-camera-permissions" )}
      buttonText={t( "OBSERVE-ORGANISMS" )}
      icon="camera"
    >
      <CameraContainer />
    </PermissionGateContainer>
  </Mortal>
);

const GalleryContainerWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={READ_WRITE_MEDIA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-from-your-gallery" )}
    titleDenied={t( "Please-Allow-Gallery-Access" )}
    body={t( "Upload-photos-from-your-gallery-and-create-observations" )}
    blockedPrompt={t( "Youve-previously-denied-gallery-permissions" )}
    buttonText={t( "CHOOSE-PHOTOS" )}
    icon="gallery"
    image={require( "images/viviana-rishe-j2330n6bg3I-unsplash.jpg" )}
  >
    <PhotoGallery />
  </PermissionGateContainer>
);

const SoundRecorderWithPermission = ( ) => (
  <Mortal>
    <PermissionGateContainer
      permissions={AUDIO_PERMISSIONS}
      title={t( "Record-organism-sounds-with-the-microphone" )}
      titleDenied={t( "Please-allow-Microphone-Access" )}
      body={t( "Use-your-devices-microphone-to-record" )}
      blockedPrompt={t( "Youve-previously-denied-microphone-permissions" )}
      buttonText={t( "RECORD-SOUND" )}
      icon="microphone"
      image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
    >
      <SoundRecorder />
    </PermissionGateContainer>
  </Mortal>
);

const NoBottomTabStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black",
      contentStyle: {
        backgroundColor: "white"
      }
    }}
  >
    {/* Add Observation Stack Group */}
    <Stack.Group>
      <Stack.Screen
        name="Camera"
        component={CameraContainerWithPermission}
        options={CAMERA_SCREEN_OPTIONS}
      />
      <Stack.Screen
        name="PhotoGallery"
        component={GalleryContainerWithPermission}
        options={hideHeader}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotosContainer}
        options={GROUP_PHOTOS_OPTIONS}
      />
      <Stack.Screen
        name="SoundRecorder"
        component={SoundRecorderWithPermission}
        options={SOUND_RECORDER_OPTIONS}
      />
    </Stack.Group>
    {SharedStackScreens( )}
  </Stack.Navigator>
);

export default NoBottomTabStackNavigator;
