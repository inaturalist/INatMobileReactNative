import { useIsFocused } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
import { Camera } from "react-native-vision-camera";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useIsForeground from "sharedHooks/useIsForeground";

import FocusSquare from "./FocusSquare";

const ReanimatedCamera = Reanimated.createAnimatedComponent( Camera );
Reanimated.addWhitelistedNativeProps( {
  zoom: true
} );

type Props = {
  cameraRef: Object,
  device: Object,
  onClassifierError?: Function,
  onDeviceNotSupported?: Function,
  onCaptureError?: Function,
  onCameraError?: Function,
  frameProcessor?: Function,
  frameProcessorFps?: number,
  animatedProps: any
};

// A container for the Camera component
// that has logic that applies to both use cases in StandardCamera and ARCamera
const CameraView = ( {
  cameraRef,
  device,
  onClassifierError,
  onDeviceNotSupported,
  onCaptureError,
  onCameraError,
  frameProcessor,
  frameProcessorFps,
  animatedProps
}: Props ): Node => {
  const [focusAvailable, setFocusAvailable] = useState( true );
  const [tappedCoordinates, setTappedCoordinates] = useState( null );
  const singleTapToFocusAnimation = useRef( new Animated.Value( 0 ) ).current;

  // check if camera page is active
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocused && isForeground;

  const { deviceOrientation } = useDeviceOrientation();

  const singleTapToFocus = async ( { x, y } ) => {
    // If the device doesn't support focus, we don't want to do anything and show no animation
    if ( !device.supportsFocus && focusAvailable ) {
      return;
    }
    try {
      singleTapToFocusAnimation.setValue( 1 );
      setTappedCoordinates( { x, y } );
      await cameraRef.current.focus( { x, y } );
    } catch ( e ) {
      // Android often catches the following error from the Camera X library
      // but it doesn't seem to affect functionality, so we're ignoring this error
      // and throwing other errors
      const startFocusError = e?.message?.includes(
        "Cancelled by another startFocusAndMetering"
      );
      if ( !startFocusError ) {
        throw e;
      }
    }
  };

  const singleTap = Gesture.Tap()
    .runOnJS( true )
    .maxDuration( 250 )
    .numberOfTaps( 1 )
    .onStart( e => singleTapToFocus( e ) );

  const onError = useCallback(
    error => {
      // error is a CameraRuntimeError =
      // { code: string, message: string, cause?: {} }
      console.log( "error", error );
      // If there is no error code, log the error
      // and return because we don't know what to do with it
      if ( !error.code ) {
        console.log( "Camera runtime error without error code:" );
        console.log( "error", error );
        return;
      }

      // If the error code is "device/focus-not-supported" disable focus
      if ( error.code === "device/focus-not-supported" ) {
        setFocusAvailable( false );
        return;
      }
      // If it is any other "device/" error, return the error code
      if ( error.code.includes( "device/" ) ) {
        console.log( "error :>> ", error );
        onDeviceNotSupported( error.code );
        return;
      }

      if ( error.code.includes( "capture/" ) ) {
        console.log( "error :>> ", error );
        onCaptureError( error.code );
        return;
      }

      // If the error code is "frame-processor/unavailable" handle the error as classifier error
      if ( error.code === "frame-processor/unavailable" ) {
        onClassifierError( error );
        return;
      }

      if ( error.code.includes( "permission/" ) ) {
        console.log( "error :>> ", error );
        if ( error.code === "permission/camera-permission-denied" ) {
          // No camera permission
          // In Seek we do not have a PermissionGate wrapper component,
          // so we need to handle this error there.
          // Here we can just log it for now, it should in principle never be hit,
          // because if we don't have permission the screen is not shown.
          return;
        }
      }
      onCameraError( error.code );
    },
    [
      onClassifierError,
      onDeviceNotSupported,
      onCaptureError,
      onCameraError
    ]
  );

  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive( singleTap )}>
        <ReanimatedCamera
          // Shared props between StandardCamera and ARCamera
          photo
          enableZoomGesture
          isActive={isActive}
          style={[StyleSheet.absoluteFill]}
          onError={e => onError( e )}
          // In Android the camera won't set the orientation metadata
          // correctly without this, but in iOS it won't display the
          // preview correctly *with* it
          orientation={Platform.OS === "android"
            ? deviceOrientation
            : null}
          ref={cameraRef}
          device={device}
          preset="photo"
          enableHighQualityPhotos
          // Props for ARCamera only
          frameProcessor={frameProcessor}
          frameProcessorFps={frameProcessorFps}
          animatedProps={animatedProps}
        />
      </GestureDetector>
      <FocusSquare
        singleTapToFocusAnimation={singleTapToFocusAnimation}
        tappedCoordinates={tappedCoordinates}
      />
    </>
  );
};

export default CameraView;
