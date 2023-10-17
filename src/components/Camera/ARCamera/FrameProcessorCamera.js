// @flow
import CameraView from "components/Camera/CameraView";
import type { Node } from "react";
import React, {
  useEffect
} from "react";
import { Platform } from "react-native";
import Config from "react-native-config";
import {
  runAtTargetFps,
  useFrameProcessor
} from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { modelPath, taxonomyPath } from "sharedHelpers/cvModel";
import { useDeviceOrientation } from "sharedHooks";
import * as InatVision from "vision-camera-plugin-inatvision";

type Props = {
  cameraRef: Object,
  device: Object,
  onTaxaDetected: Function,
  onClassifierError: Function,
  onDeviceNotSupported: Function,
  onCaptureError: Function,
  onCameraError: Function,
  onLog: Function,
  animatedProps: any,
  onZoomStart?: Function,
  onZoomChange?: Function,
  takingPhoto: boolean,
};

const version = Config.CV_MODEL_VERSION;
// Johannes: when I copied over the native code from the legacy react-native-camera on Android
// this value had to be a string. On iOS I changed the API to also accept a string (was number).
// Maybe, the intention would look clearer if we refactor to use a number here.
const confidenceThreshold = "0.5";

const FrameProcessorCamera = ( {
  cameraRef,
  device,
  onTaxaDetected,
  onClassifierError,
  onDeviceNotSupported,
  onCaptureError,
  onCameraError,
  onLog,
  animatedProps,
  onZoomStart,
  onZoomChange,
  takingPhoto
}: Props ): Node => {
  const { deviceOrientation } = useDeviceOrientation();

  useEffect( () => {
    // This registers a listener for the frame processor plugin's log events
    // iOS part exposes no logging, so calling it would crash
    if ( Platform.OS === "android" ) {
      InatVision.addLogListener( event => {
        // The vision-plugin events are in this format { log: "string" }
        onLog( event );
      } );
    }

    return () => {
      InatVision.removeLogListener();
    };
  }, [onLog] );

  const handleResults = Worklets.createRunInJsFn( predictions => {
    onTaxaDetected( predictions );
  } );

  const handleError = Worklets.createRunInJsFn( error => {
    onClassifierError( error );
  } );

  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }

      runAtTargetFps( 1, () => {
        "worklet";

        // Reminder: this is a worklet, running on the UI thread.
        try {
          const results = InatVision.inatVision( frame, {
            version,
            modelPath,
            taxonomyPath,
            confidenceThreshold,
            patchedOrientationAndroid: deviceOrientation
          } );
          handleResults( results );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          handleError( classifierError );
        }
      } );
    },
    [version, confidenceThreshold, takingPhoto, deviceOrientation]
  );

  return (
    <CameraView
      cameraRef={cameraRef}
      device={device}
      onClassifierError={onClassifierError}
      onDeviceNotSupported={onDeviceNotSupported}
      onCaptureError={onCaptureError}
      onCameraError={onCameraError}
      frameProcessor={frameProcessor}
      animatedProps={animatedProps}
      onZoomStart={onZoomStart}
      onZoomChange={onZoomChange}
    />
  );
};

export default FrameProcessorCamera;
