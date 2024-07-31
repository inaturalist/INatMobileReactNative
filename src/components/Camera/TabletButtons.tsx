import classnames from "classnames";
import Gallery from "components/Camera/Buttons/Gallery.tsx";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { TakePhotoOptions } from "react-native-vision-camera";

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

interface Props {
  changeZoom: ( _event: GestureResponderEvent ) => void;
  disabled: boolean;
  flipCamera: ( _event: GestureResponderEvent ) => void;
  handleCheckmarkPress?: ( _event: GestureResponderEvent ) => void;
  handleClose?: ( _event: GestureResponderEvent ) => void;
  hasFlash?: boolean;
  hasGalleryButton?: boolean;
  photosTaken?: boolean;
  rotatableAnimatedStyle: ViewStyle;
  showPrediction?: boolean;
  showZoomButton: boolean;
  takePhoto: () => Promise<void>;
  takePhotoOptions: TakePhotoOptions;
  toggleFlash: ( _event: GestureResponderEvent ) => void;
  zoomTextValue: string;
}

// Empty space where a camera button should be so buttons don't jump around
// when they appear or disappear
const CameraButtonPlaceholder = ( { extraClassName }: { extraClassName?: string } ) => (
  <View
    accessibilityElementsHidden
    aria-hidden
    className={classnames(
      // "bg-deeppink",
      `w-[${CAMERA_BUTTON_DIM}px]`,
      `h-[${CAMERA_BUTTON_DIM}px]`,
      extraClassName
    )}
  />
);

const TabletButtons = ( {
  changeZoom,
  disabled,
  flipCamera,
  handleCheckmarkPress,
  handleClose,
  hasFlash,
  hasGalleryButton,
  photosTaken,
  rotatableAnimatedStyle,
  showPrediction,
  showZoomButton,
  takePhoto,
  takePhotoOptions,
  toggleFlash,
  zoomTextValue
}: Props ) => {
  const tabletCameraOptionsClasses = [
    "absolute",
    "items-center",
    "justify-center",
    "mr-5",
    "p-0",
    "right-0",
    "h-full"
  ];

  return (
    <View className={classnames( tabletCameraOptionsClasses )} pointerEvents="box-none">
      { photosTaken && <CameraButtonPlaceholder extraClassName="mb-[25px]" /> }
      <Zoom
        changeZoom={changeZoom}
        zoomTextValue={zoomTextValue}
        showZoomButton={showZoomButton}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        zoomClassName="mb-[25px]"
      />
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        flashClassName="m-0 mb-[25px]"
      />
      <CameraFlip
        flipCamera={flipCamera}
        cameraFlipClasses="m-0"
      />
      <View className="mt-[40px] mb-[40px]">
        <TakePhoto
          disabled={disabled}
          takePhoto={takePhoto}
          showPrediction={showPrediction}
        />
      </View>
      { photosTaken && (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( checkmarkClasses )}
        >
          <GreenCheckmark
            handleCheckmarkPress={handleCheckmarkPress || ( () => null )}
          />
        </Animated.View>
      ) }
      <View
        className={classnames(
          cameraOptionsClasses,
          { "mt-[25px]": photosTaken }
        )}
      >
        <CloseButton
          handleClose={handleClose}
          size={18}
        />
      </View>
      { hasFlash && <CameraButtonPlaceholder extraClassName="mt-[25px]" /> }
      { showZoomButton && <CameraButtonPlaceholder extraClassName="mt-[25px]" /> }
      { hasGalleryButton && (
        <View className="absolute bottom-6">
          <Gallery rotatableAnimatedStyle={rotatableAnimatedStyle} />
        </View>
      ) }
    </View>
  );
};

export default TabletButtons;
