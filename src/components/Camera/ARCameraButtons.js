// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";

import CameraFlip from "./Buttons/CameraFlip";
import Close from "./Buttons/Close";
import Flash from "./Buttons/Flash";
import TakePhoto from "./Buttons/TakePhoto";
import TabletButtons from "./TabletButtons";

const isTablet = DeviceInfo.isTablet();

// <>
// <View className="h-full justify-center absolute right-6">
//   <TakePhoto
//     disallowAddingPhotos={false}
//     takePhoto={takePhoto}
//     showPrediction
//   />
// </View>
// <View
//   className="bottom-10 absolute right-5 left-5 flex-row justify-between items-center"
// >
//   <View className="flex-row justify-evenly w-[180px]">
//     <Flash
//       toggleFlash={toggleFlash}
//       hasFlash={hasFlash}
//       takePhotoOptions={takePhotoOptions}
//       rotatableAnimatedStyle={rotatableAnimatedStyle}
//     />
//     <CameraFlip flipCamera={flipCamera} />
//   </View>
//   <View className="w-[74px] items-center">
//     <Close />
//   </View>
// </View>
// </>

type Props = {
  takePhoto: Function,
  rotatableAnimatedStyle: Object,
  toggleFlash: Function,
  flipCamera: Function,
  hasFlash: boolean,
  takePhotoOptions: Object,
  showPrediction: boolean
}

const ARCameraButtons = ( {
  takePhoto,
  rotatableAnimatedStyle,
  flipCamera,
  toggleFlash,
  hasFlash,
  takePhotoOptions,
  showPrediction
}: Props ): Node => ( isTablet
  ? (
    <TabletButtons
      takePhoto={takePhoto}
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      toggleFlash={toggleFlash}
      flipCamera={flipCamera}
      hasFlash={hasFlash}
      takePhotoOptions={takePhotoOptions}
      showPrediction={showPrediction}
    />
  )
  : (
    <View className="bottom-10 absolute right-5 left-5">
      <View className="flex-row justify-end">
        <Flash
          toggleFlash={toggleFlash}
          hasFlash={hasFlash}
          takePhotoOptions={takePhotoOptions}
          rotatableAnimatedStyle={rotatableAnimatedStyle}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Close />
        <TakePhoto
          disallowAddingPhotos={false}
          takePhoto={takePhoto}
          showPrediction={showPrediction}
        />
        <CameraFlip flipCamera={flipCamera} />
      </View>
    </View>
  ) );

export default ARCameraButtons;
