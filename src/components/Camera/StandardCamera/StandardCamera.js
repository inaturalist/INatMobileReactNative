// @flow

import { useNavigation } from "@react-navigation/native";
import CameraView from "components/Camera/CameraView";
import FadeInOutView from "components/Camera/FadeInOutView";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext,
  useEffect,
  useState
} from "react";
import DeviceInfo from "react-native-device-info";
import { Snackbar } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";

import CameraNavButtons from "./CameraNavButtons";
import CameraOptionsButtons from "./CameraOptionsButtons";
import DiscardChangesSheet from "./DiscardChangesSheet";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet( );

export const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  navToObsEdit: Function,
  flipCamera: Function,
  toggleFlash: Function,
  changeZoom: Function,
  takePhoto: Function,
  handleBackButtonPress: Function,
  rotatableAnimatedStyle: Object,
  rotation: any,
  isLandscapeMode: boolean,
  device: any,
  camera: any,
  hasFlash: boolean,
  takePhotoOptions: Object,
  setShowDiscardSheet: Function,
  showDiscardSheet: boolean,
  takingPhoto: boolean,
  animatedProps: any,
  zoom: number,
  onZoomStart?: Function,
  onZoomChange?: Function
}

const StandardCamera = ( {
  navToObsEdit,
  flipCamera,
  toggleFlash,
  takePhoto,
  handleBackButtonPress,
  rotatableAnimatedStyle,
  rotation,
  isLandscapeMode,
  device,
  camera,
  hasFlash,
  takePhotoOptions,
  setShowDiscardSheet,
  showDiscardSheet,
  takingPhoto,
  changeZoom,
  animatedProps,
  zoom,
  onZoomStart,
  onZoomChange
}: Props ): Node => {
  const {
    allObsPhotoUris
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const [dismissChanges, setDismissChanges] = useState( false );
  const { screenWidth } = useDeviceOrientation( );

  const photosTaken = allObsPhotoUris.length > 0;

  useEffect( ( ) => {
    // We do this navigation indirectly (vs doing it directly in DiscardChangesSheet),
    // since we need for the bottom sheet of discard-changes to first finish dismissing,
    // only then we can do the navigation - otherwise, this causes the bottom sheet
    // to sometimes pop back up on the next screen - see GH issue #629
    if ( !showDiscardSheet ) {
      if ( dismissChanges ) {
        navigation.goBack();
      }
    }
  }, [dismissChanges, showDiscardSheet, navigation] );

  const handleTakePhoto = async ( ) => {
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      return;
    }
    await takePhoto( );
  };

  return (
    <>
      <PhotoPreview
        rotation={rotation}
        takingPhoto={takingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={screenWidth > BREAKPOINTS.md}
        isTablet={isTablet}
      />
      <View className="relative flex-1">
        {device && (
          <CameraView
            cameraRef={camera}
            device={device}
            animatedProps={animatedProps}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
          />
        )}
        <FadeInOutView takingPhoto={takingPhoto} />
        <CameraOptionsButtons
          takePhoto={handleTakePhoto}
          handleClose={handleBackButtonPress}
          disallowAddingPhotos={disallowAddingPhotos}
          photosTaken={photosTaken}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
          navToObsEdit={navToObsEdit}
          toggleFlash={toggleFlash}
          flipCamera={flipCamera}
          hasFlash={hasFlash}
          takePhotoOptions={takePhotoOptions}
          changeZoom={changeZoom}
          zoom={zoom}
        />
      </View>
      <CameraNavButtons
        takePhoto={handleTakePhoto}
        handleClose={handleBackButtonPress}
        disallowAddingPhotos={disallowAddingPhotos}
        photosTaken={photosTaken}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        navToObsEdit={navToObsEdit}
      />
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
      <DiscardChangesSheet
        setShowDiscardSheet={setShowDiscardSheet}
        hidden={!showDiscardSheet}
        onDiscard={() => {
          setDismissChanges( true );
        }}
      />
    </>
  );
};

export default StandardCamera;
