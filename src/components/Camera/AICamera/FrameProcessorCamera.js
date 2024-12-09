// @flow
import { useNavigation } from "@react-navigation/native";
import CameraView from "components/Camera/CameraView.tsx";
import {
  useFrameProcessor
} from "components/Camera/helpers/visionCameraWrapper";
import InatVision from "components/Camera/helpers/visionPluginWrapper";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import { Platform } from "react-native";
import { Worklets } from "react-native-worklets-core";
import {
  geomodelPath,
  modelPath,
  modelVersion,
  taxonomyPath
} from "sharedHelpers/mlModel.ts";
import { logStage } from "sharedHelpers/sentinelFiles.ts";
import {
  orientationPatchFrameProcessor,
  usePatchedRunAsync
} from "sharedHelpers/visionCameraPatches";
import { useDeviceOrientation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  // $FlowIgnore
  animatedProps: unknown,
  cameraRef: Object,
  confidenceThreshold?: number,
  device: Object,
  fps?: number,
  numStoredResults?: number,
  cropRatio?: number,
  onCameraError: Function,
  onCaptureError: Function,
  onClassifierError: Function,
  onDeviceNotSupported: Function,
  onLog: Function,
  onTaxaDetected: Function,
  pinchToZoom?: Function,
  takingPhoto: boolean,
  taxonomyRollupCutoff?: number,
  inactive?: boolean,
  resetCameraOnFocus: Function,
  userLocation?: Object // UserLocation | null
};

const DEFAULT_FPS = 1;
const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;
const DEFAULT_TAXONOMY_CUTOFF_THRESHOLD = 0.0;
const DEFAULT_NUM_STORED_RESULTS = 4;
const DEFAULT_CROP_RATIO = 1.0;

let framesProcessingTime = [];

const FrameProcessorCamera = ( {
  animatedProps,
  cameraRef,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  cropRatio = DEFAULT_CROP_RATIO,
  device,
  fps = DEFAULT_FPS,
  numStoredResults = DEFAULT_NUM_STORED_RESULTS,
  onCameraError,
  onCaptureError,
  onClassifierError,
  onDeviceNotSupported,
  onLog,
  onTaxaDetected,
  pinchToZoom,
  takingPhoto,
  taxonomyRollupCutoff = DEFAULT_TAXONOMY_CUTOFF_THRESHOLD,
  inactive,
  resetCameraOnFocus,
  userLocation
}: Props ): Node => {
  const sentinelFileName = useStore( state => state.sentinelFileName );
  const { deviceOrientation } = useDeviceOrientation();
  const [lastTimestamp, setLastTimestamp] = useState( undefined );

  const navigation = useNavigation();

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

  useEffect( () => {
    const unsubscribeFocus = navigation.addListener( "focus", () => {
      InatVision.resetStoredResults( );
      resetCameraOnFocus( );
    } );

    return unsubscribeFocus;
  }, [navigation, resetCameraOnFocus] );

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", () => {
      InatVision.resetStoredResults();
      resetCameraOnFocus( );
    } );

    return unsubscribeBlur;
  }, [navigation, resetCameraOnFocus, sentinelFileName] );

  const handleResults = Worklets.createRunOnJS( ( result, timeTaken ) => {
    setLastTimestamp( result.timestamp );
    framesProcessingTime.push( timeTaken );
    if ( framesProcessingTime.length === 10 ) {
      const avgTime = framesProcessingTime.reduce( ( a, b ) => a + b, 0 ) / 10;
      onLog( { log: `Average frame processing time over 10 frames: ${avgTime}ms` } );
      framesProcessingTime = [];
    }
    onTaxaDetected( result );
  } );

  const handleError = Worklets.createRunOnJS( error => {
    onClassifierError( error );
  } );

  const patchedOrientationAndroid = orientationPatchFrameProcessor( deviceOrientation );
  const patchedRunAsync = usePatchedRunAsync( );
  const frameProcessor = useFrameProcessor(
    frame => {
      "worklet";

      if ( takingPhoto ) {
        return;
      }
      const timestamp = Date.now();
      // If there is no lastTimestamp, i.e. the first time this runs do not compare
      if ( lastTimestamp ) {
        const timeSinceLastFrame = timestamp - lastTimestamp;
        if ( timeSinceLastFrame < 1000 / fps ) {
          return;
        }
      }

      patchedRunAsync( frame, ( ) => {
        "worklet";

        // Reminder: this is a worklet, running on a C++ thread. Make sure to check the
        // react-native-worklets-core documentation for what is supported in those worklets.
        const timeBefore = Date.now();
        try {
          const result = InatVision.inatVision( frame, {
            version: modelVersion,
            modelPath,
            taxonomyPath,
            confidenceThreshold,
            taxonomyRollupCutoff,
            numStoredResults,
            cropRatio,
            patchedOrientationAndroid,
            useGeoModel: !!userLocation,
            geoModelPath: geomodelPath,
            location: {
              latitude: userLocation?.latitude,
              longitude: userLocation?.longitude,
              elevation: userLocation?.altitude
            }
          } );
          const timeAfter = Date.now();
          const timeTaken = timeAfter - timeBefore;
          handleResults( result, timeTaken );
        } catch ( classifierError ) {
          console.log( `Error: ${classifierError.message}` );
          handleError( classifierError );
        }
      } );
    },
    [
      patchedRunAsync,
      modelVersion,
      confidenceThreshold,
      takingPhoto,
      taxonomyRollupCutoff,
      patchedOrientationAndroid,
      numStoredResults,
      cropRatio,
      lastTimestamp,
      fps,
      userLocation
    ]
  );

  return (
    <CameraView
      animatedProps={animatedProps}
      cameraRef={cameraRef}
      device={device}
      frameProcessor={frameProcessor}
      onCameraError={async ( ) => {
        await logStage( sentinelFileName, "fallback_camera_error" );
        onCameraError( );
      }}
      onCaptureError={async ( ) => {
        await logStage( sentinelFileName, "camera_capture_error" );
        onCaptureError( );
      }}
      onClassifierError={async ( ) => {
        await logStage( sentinelFileName, "camera_classifier_error" );
        onClassifierError( );
      }}
      onDeviceNotSupported={async ( ) => {
        await logStage( sentinelFileName, "camera_device_not_supported_error" );
        onDeviceNotSupported( );
      }}
      pinchToZoom={pinchToZoom}
      inactive={inactive}
    />
  );
};

export default FrameProcessorCamera;
