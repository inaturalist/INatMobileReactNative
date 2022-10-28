// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { Avatar, Snackbar, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import Photo from "realmModels/Photo";

import colors from "../../../tailwind-colors";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

const { useRealm } = RealmContext;

export const MAX_PHOTOS_ALLOWED = 20;

const StandardCamera = ( ): Node => {
  const { colors: themeColors } = useTheme( );
  const { addPhotos } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const photos = params?.photos;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( "wide-angle-camera" );
  const device = devices[cameraPosition];
  const [takePhotoOptions, setTakePhotoOptions] = useState( {
    flash: "off"
  } );
  const [photoUris, setPhotoUris] = useState( [] );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const disallowAddingPhotos = photoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );

  const photosTaken = photoUris.length > 0;

  const realm = useRealm( );

  const takePhoto = async ( ) => {
    setSavingPhoto( true );
    try {
      if ( disallowAddingPhotos ) {
        setShowAlert( true );
        setSavingPhoto( false );
        return;
      }
      const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
      const uri = await Photo.savePhoto( realm, cameraPhoto );

      setPhotoUris( photoUris.concat( [uri] ) );
      setSavingPhoto( false );
    } catch ( e ) {
      console.log( e, "couldn't take photo" );
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
    addPhotos( photoUris );
    navigation.navigate(
      "ObsEdit",
      { lastScreen: photos && photos.length > 0 ? null : "StandardCamera" }
    );
  };

  useEffect( ( ) => {
    if ( photos?.length > 0 ) {
      setPhotoUris( photos );
    }
  }, [photos] );

  const renderCameraOptionsButtons = icon => (
    <Avatar.Icon
      size={40}
      icon={icon}
      style={{ backgroundColor: colors.gray }}
    />
  );

  const renderCameraButton = ( icon, disabled ) => (
    <Avatar.Icon
      size={60}
      icon={icon}
      style={{ backgroundColor: disabled ? colors.gray : themeColors.background }}
    />
  );

  return (
    <View className="flex-1 bg-black">
      {device && <CameraView device={device} camera={camera} />}
      <PhotoPreview photoUris={photoUris} setPhotoUris={setPhotoUris} savingPhoto={savingPhoto} />
      <FadeInOutView savingPhoto={savingPhoto} />
      <View className="absolute bottom-0">
        <View className="flex-row justify-between w-screen mb-4 px-4">
          <Pressable onPress={toggleFlash}>
            {renderCameraOptionsButtons( "flash" )}
          </Pressable>
          <Pressable onPress={flipCamera}>
            {renderCameraOptionsButtons( "camera-flip" )}
          </Pressable>
        </View>
        <View className="bg-black w-screen h-32 flex-row justify-between items-center px-4">
          <Pressable
            className="w-1/3 pt-4 pb-4 pl-3"
            onPress={( ) => navigation.goBack( )}
          >
            <Icon name="arrow-back-ios" size={25} color={colors.white} />
          </Pressable>
          <Pressable onPress={takePhoto}>
            {renderCameraButton( "circle-outline", disallowAddingPhotos )}
          </Pressable>
          {photosTaken ? (
            <Text className="text-white text-xl w-1/3 text-center pr-4" onPress={navToObsEdit}>
              {t( "Next" )}
            </Text>
          ) : <View className="w-1/3" />}
        </View>
      </View>
      <Snackbar
        visible={showAlert}
        onDismiss={( ) => setShowAlert( false )}
      >
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
    </View>
  );
};

export default StandardCamera;
