// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Pressable,
  View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import {
  Dimensions, StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import { Avatar, Snackbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import colors from "styles/tailwindColors";

import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

export const MAX_PHOTOS_ALLOWED = 20;

const StandardCamera = ( ): Node => {
  const {
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    setCameraPreviewUris,
    allObsPhotoUris,
    evidenceToAdd,
    setEvidenceToAdd
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = hasFlash ? { flash: "off" } : { };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const initialWidth = Dimensions.get( "screen" ).width;
  const [footerWidth, setFooterWidth] = useState( initialWidth );
  const [imageOrientation, setImageOrientation] = useState( "portrait" );

  const isTablet = DeviceInfo.isTablet();

  const photosTaken = allObsPhotoUris.length > 0;

  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }

  // detect device rotation instead of using screen orientation change
  const onDeviceRotation = orientation => {
    // react-native-orientation-locker and react-native-vision-camera
    // have opposite definitions for landscape right/left
    if ( _.camelCase( orientation ) === "landscapeRight" ) {
      setImageOrientation( "landscapeLeft" );
    } else if ( _.camelCase( orientation ) === "landscapeLeft" ) {
      setImageOrientation( "landscapeRight" );
    } else {
      setImageOrientation( orientation );
    }
  };

  useEffect( () => {
    Orientation.addDeviceOrientationListener( onDeviceRotation );

    // allows bottom buttons bar to fill entire width of screen on rotation
    Dimensions.addEventListener( "change", ( { window: { width } } ) => {
      if ( isTablet ) setFooterWidth( width );
    } );

    return () => {
      Orientation.removeOrientationListener( onDeviceRotation );
    };
  }, [isTablet, footerWidth] );

  const takePhoto = async ( ) => {
    console.log( "pressed" );
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const newPhoto = await Photo.new( cameraPhoto.path );
      const uri = newPhoto.localFilePath;

      setCameraPreviewUris( cameraPreviewUris.concat( [uri] ) );
      if ( addEvidence ) {
        setEvidenceToAdd( [...evidenceToAdd, uri] );
      }
      setSavingPhoto( false );
    } catch ( e ) {
      setSavingPhoto( false );
    }
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on" ? "off" : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back" ? "front" : "back";
    setCameraPosition( newPosition );
  };

  const navToObsEdit = ( ) => {
    if ( addEvidence ) {
      addCameraPhotosToCurrentObservation( evidenceToAdd );
      navigation.navigate( "ObsEdit" );
      return;
    }
    createObsWithCameraPhotos( cameraPreviewUris );
    navigation.navigate( "ObsEdit" );
  };

  const renderAddObsButtons = icon => {
    let testID = "";
    let accessibilityLabel = "";
    let accessibilityValue = "";
    switch ( icon ) {
      case "flash":
        testID = "flash-button-label-flash";
        accessibilityLabel = t( "Flash-button-label-flash" );
        accessibilityValue = t( "Flash-button-value-flash" );
        break;
      case "flash-off":
        testID = "flash-button-label-flash-off";
        accessibilityLabel = t( "Flash-button-label-flash-off" );
        accessibilityValue = t( "Flash-button-value-flash-off" );
        break;
      default:
        break;
    }
    return (
      <Avatar.Icon
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={accessibilityValue}
        size={40}
        icon={icon}
        style={{ backgroundColor: colors.gray }}
      />
    );
  };

  const renderCameraButton = ( icon, disabled ) => (
    <Avatar.Icon
      size={60}
      icon={icon}
      style={{ backgroundColor: disabled ? colors.gray : colors.white }}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      {device && <CameraView device={device} camera={camera} orientation={imageOrientation} />}
      <PhotoPreview
        photoUris={cameraPreviewUris}
        setPhotoUris={setCameraPreviewUris}
        savingPhoto={savingPhoto}
        deviceOrientation={imageOrientation}
      />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View className="absolute bottom-0 w-full">
        <View className={`flex-row justify-between w-${footerWidth} mb-4 px-4 `}>
          {hasFlash ? (
            <Pressable onPress={toggleFlash} accessibilityRole="button">
              {takePhotoOptions.flash === "on"
                ? renderAddObsButtons( "flash" )
                : renderAddObsButtons( "flash-off" )}
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={flipCamera}
            accessibilityLabel={t( "Camera-button-label-switch-camera" )}
            accessibilityValue={{
              text: cameraPosition === "back"
                ? t( "Camera-button-value-back" )
                : t( "Camera-button-value-front" )
            }}
            accessibilityRole="button"
          >
            <Avatar.Icon
              testID="camera-button-label-switch-camera"
              size={40}
              icon="camera-flip"
              style={{ backgroundColor: colors.gray }}
            />
          </Pressable>
        </View>
        <View className="bg-black h-32 flex-row justify-between p-6">
          <Pressable
            className="pt-2 pb-4"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t( "Navigate-back" )}
            accessibilityRole="button"
          >
            <Icon name="close" size={35} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={takePhoto}
            accessibilityLabel={t( "Take-photo" )}
            accessibilityRole="button"
          >
            {renderCameraButton( "circle-outline", disallowAddingPhotos )}
          </Pressable>
          {photosTaken ? (
            <Pressable
              className="pt-2 pb-4 flex-row"
              onPress={navToObsEdit}
            >
              <Icon name="check-circle" size={45} color={colors.inatGreen} />
            </Pressable>
          ) : (
            <View className="pt-2 pb-4 flex-row">
              <Icon name="check-circle" size={45} color={colors.black} />
            </View>
          )}
        </View>
      </View>
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
