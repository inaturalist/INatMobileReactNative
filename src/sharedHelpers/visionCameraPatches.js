/*
    This file contains various patches for handling the react-native-vision-camera library.
*/

import {
  rotatedOriginalPhotosPath
} from "appConstants/paths.ts";
import { Platform } from "react-native";
import { isTablet } from "react-native-device-info";
import RNFS from "react-native-fs";
import {
  useSharedValue as useWorkletSharedValue,
  Worklets
} from "react-native-worklets-core";
import resizeImage from "sharedHelpers/resizeImage.ts";
import { unlink } from "sharedHelpers/util";
import {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";

// Needed for react-native-vision-camera on iPhones
// As of this version the photo from takePhoto on is not oriented coming from the native side.
// E.g. if you take a photo in landscape-right and save it to camera roll directly from the
// vision camera, it will be tilted in the native photo app. So, on iOS, depending on the
// metadata of the photo the rotation needs to be set to 0 or 180.
// On Android, the rotation is derived from the device orientation at the time of taking the
// photo, because orientation is not yet supported in the library.
export const rotationTempPhotoPatch = deviceOrientation => {
  let photoRotation = 0;
  if ( Platform.OS === "ios" ) {
    if ( !isTablet() ) {
      switch ( deviceOrientation ) {
        case PORTRAIT:
          photoRotation = 0;
          break;
        case LANDSCAPE_RIGHT:
          photoRotation = 90;
          break;
        case LANDSCAPE_LEFT:
          photoRotation = -90;
          break;
        case PORTRAIT_UPSIDE_DOWN:
          photoRotation = 180;
          break;
        default:
          photoRotation = 0;
      }
    }
  }
  return photoRotation;
};

// Needed for react-native-vision-camera
// This patch is used to rotate the photo taken with the vision camera.
// Because the photos coming from the vision camera are not oriented correctly, we
// rotate them with image-resizer as a first step, replacing the original photo.
export const rotatePhotoPatch = async ( photo, rotation ) => {
  const path = rotatedOriginalPhotosPath;
  await RNFS.mkdir( path );
  // Rotate the image with ImageResizer
  const image = await resizeImage(
    photo.path,
    {
      width: photo.width,
      height: photo.height,
      rotation,
      outputPath: path
    }
  );
  // Remove original photo
  await unlink( photo.path );
  return image;
};

// Needed for react-native-vision-camera
// This patch is here to remember to replace the rotation used when resizing the original
// photo to a smaller local copy we keep in the app cache. Previously we had a flow where
// we would resize the original photo to a smaller version including rotation. Now, we
// rotate the original photo first with image-resizer separately to save to camera roll,
// and then resize this copy to a smaller version. In case the first step is redundant
// in the future, we keep this patch here to remind us to put the rotation back to resizing
// the smaller photo.
export const rotationLocalPhotoPatch = () => 0;

// This patch is currently required because we are using react-native-vision-camera v4.0.3
// together wit react-native-reanimated. The problem is that the runAsync function
// from react-native-vision-camera does not work in release mode with this reanimated.
// Uses this workaround: https://gist.github.com/nonam4/7a6409cd1273e8ed7466ba3a48dd1ecc but adapted it to
// version 4 of vision-camera.
// Originally, posted on this currently open issue: https://github.com/mrousavy/react-native-vision-camera/issues/2589
export const usePatchedRunAsync = ( ) => {
  /**
   * Print worklets logs/errors on js thread
   */
  const logOnJs = Worklets.createRunOnJS( ( log, error ) => {
    console.log( "logOnJs - ", log, " - error?:", error?.message ?? "no error" );
  } );
  const isAsyncContextBusy = useWorkletSharedValue( false );
  const customRunOnAsyncContext = Worklets.defaultContext.createRunAsync(
    ( frame, func ) => {
      "worklet";

      try {
        func( frame );
      } catch ( e ) {
        logOnJs( "customRunOnAsyncContext error", e );
      } finally {
        frame.decrementRefCount();
        isAsyncContextBusy.value = false;
      }
    }
  );

  function customRunAsync( frame, func ) {
    "worklet";

    if ( isAsyncContextBusy.value ) {
      return;
    }
    isAsyncContextBusy.value = true;
    const internal = frame;
    internal.incrementRefCount();
    customRunOnAsyncContext( internal, func );
  }

  return customRunAsync;
};
