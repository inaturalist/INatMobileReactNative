// @flow

import classnames from "classnames";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";

import CameraFlip from "./Buttons/CameraFlip";
import Flash from "./Buttons/Flash";
import GreenCheckmark from "./Buttons/GreenCheckmark";
import TakePhoto from "./Buttons/TakePhoto";
import Zoom from "./Buttons/Zoom";

const isTablet = DeviceInfo.isTablet();

const CAMERA_BUTTON_DIM = 40;

const checkmarkClasses = [
  "bg-inatGreen",
  "rounded-full",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  `w-[${CAMERA_BUTTON_DIM}px]`,
  "justify-center",
  "items-center"
].join( " " );

const cameraOptionsClasses = [
  "bg-black/50",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CAMERA_BUTTON_DIM}px]`
].join( " " );

type Props = {
  takePhoto: Function,
  handleClose?: Function,
  disallowAddingPhotos?: boolean,
  photosTaken?: boolean,
  rotatableAnimatedStyle: Object,
  navToObsEdit?: Function,
  toggleFlash: Function,
  flipCamera: Function,
  changeZoom: Function,
  hasFlash: boolean,
  takePhotoOptions: Object,
  showPrediction?: boolean,
  zoom: number
}

// Empty space where a camera button should be so buttons don't jump around
// when they appear or disappear
const CameraButtonPlaceholder = ( ) => (
  <View
    accessibilityElementsHidden
    aria-hidden
    className={classnames(
      `w-[${CAMERA_BUTTON_DIM}px]`,
      `h-[${CAMERA_BUTTON_DIM}px]`
    )}
  />
);

const TabletButtons = ( {
  takePhoto,
  handleClose,
  disallowAddingPhotos,
  photosTaken,
  rotatableAnimatedStyle,
  navToObsEdit,
  toggleFlash,
  flipCamera,
  hasFlash,
  takePhotoOptions,
  showPrediction,
  changeZoom,
  zoom
}: Props ): Node => {
  const tabletCameraOptionsClasses = [
    "absolute",
    "h-[380px]",
    "items-center",
    "justify-center",
    "mr-5",
    "mt-[-190px]",
    "pb-0",
    "right-0",
    "top-[50%]"
  ];

  return (
    <View className={classnames( tabletCameraOptionsClasses )}>
      <Zoom
        changeZoom={changeZoom}
        zoom={zoom}
      />
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
      />
      <CameraFlip
        flipCamera={flipCamera}
        cameraFlipClasses="m-0 mt-[25px]"
      />
      <View className="mt-[40px] mb-[40px]">
        <TakePhoto
          disallowAddingPhotos={disallowAddingPhotos}
          takePhoto={takePhoto}
          showPrediction={showPrediction}
        />
      </View>
      { photosTaken && (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( checkmarkClasses, "mb-[25px]" )}
        >
          <GreenCheckmark
            navToObsEdit={navToObsEdit}
          />
        </Animated.View>
      ) }
      <View
        className={classnames(
          cameraOptionsClasses,
          { "mb-[25px]": !photosTaken }
        )}
      >
        <CloseButton
          handleClose={handleClose}
          size={18}
        />
      </View>
      { !photosTaken && <CameraButtonPlaceholder /> }
    </View>
  );
};

export default TabletButtons;
