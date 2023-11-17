import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import PermissionGateContainer, { READ_MEDIA_PERMISSIONS }
  from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useState
} from "react";
import {
  InteractionManager,
  Platform,
  View
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { ActivityIndicator } from "react-native-paper";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import colors from "styles/tailwindColors";

const MAX_PHOTOS_ALLOWED = 20;

const sleep = ms => new Promise( resolve => {
  setTimeout( resolve, ms );
} );

const PhotoGallery = ( ): Node => {
  const navigation = useNavigation( );
  const [photoGalleryShown, setPhotoGalleryShown] = useState( false );
  const [permissionGranted, setPermissionGranted] = useState( false );
  const {
    galleryUris,
    evidenceToAdd,
    setGroupedPhotos,
    groupedPhotos,
    updateObservations,
    numOfObsPhotos,
    currentObservation,
    setPhotoImporterState
  } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const skipGroupPhotos = params
    ? params.skipGroupPhotos
    : false;
  const fromGroupPhotos = params
    ? params.fromGroupPhotos
    : false;

  const showPhotoGallery = React.useCallback( async () => {
    if ( photoGalleryShown ) {
      return;
    }

    setPhotoGalleryShown( true );

    if ( Platform.OS === "ios" ) {
      // iOS has annoying transition of the screen - that if we don't wait enough time,
      // the launchImageLibrary would halt and not return (and not showing any image picker)
      await sleep( 500 );
    }

    // According to the native code of the image picker library, it never rejects the promise,
    // just returns a response object with errorCode
    const response = await ImagePicker.launchImageLibrary( {
      selectionLimit: MAX_PHOTOS_ALLOWED,
      mediaType: "photo",
      includeBase64: false,
      includeExtra: true,
      forceOldAndroidPhotoPicker: true,
      chooserTitle: t( "Import-Photos-From" ),
      presentationStyle: "fullScreen"
    } );

    if ( !response || response.didCancel || !response.assets || response.errorCode ) {
      // User cancelled selection of photos - close current screen

      if ( fromGroupPhotos ) {
        // This screen was called from the plus button of the group photos screen - get back to it
        navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
        navigation.setParams( { fromGroupPhotos: false } );
      } else {
        navigation.goBack();
      }
      setPhotoGalleryShown( false );
      return;
    }

    const selectedImages = response.assets.map( x => ( { image: x } ) );

    if ( fromGroupPhotos ) {
      // This screen was called from the plus button of the group photos screen - get back to it
      // after adding the newly selected photos
      setGroupedPhotos( [...groupedPhotos, ...selectedImages.map( photo => ( {
        photos: [photo]
      } ) )] );
      navigation.setParams( { fromGroupPhotos: false } );
      navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
      setPhotoGalleryShown( false );
      return;
    }

    const navToObsEdit = () => navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );

    if ( skipGroupPhotos ) {
      // add evidence to existing observation
      setPhotoImporterState( {
        galleryUris: [...galleryUris, ...response.assets.map( x => x.uri )],
        evidenceToAdd: [...evidenceToAdd, ...response.assets.map( x => x.uri )]
      } );
      const obsPhotos = await ObservationPhoto
        .createObsPhotosWithPosition( selectedImages, { position: numOfObsPhotos } );
      const newObservations = Observation.appendObsPhotos( obsPhotos, currentObservation );
      updateObservations( newObservations );
      navToObsEdit();
      setPhotoGalleryShown( false );
    } else if ( selectedImages.length === 1 ) {
      // create a new observation and skip group photos screen
      const newObservation = await Observation.createObservationWithPhotos( [selectedImages[0]] );
      setPhotoImporterState( {
        observations: [newObservation]
      } );
      navToObsEdit();
      setPhotoGalleryShown( false );
    } else {
      // navigate to group photos
      setPhotoImporterState( {
        galleryUris: [...galleryUris, ...response.assets.map( x => x.uri )],
        groupedPhotos: selectedImages.map( photo => ( {
          photos: [photo]
        } ) )
      } );
      navigation.setParams( { fromGroupPhotos: false } );
      navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
      setPhotoGalleryShown( false );
    }
  }, [
    photoGalleryShown, numOfObsPhotos, setPhotoImporterState,
    evidenceToAdd, galleryUris, navigation, setGroupedPhotos,
    fromGroupPhotos, skipGroupPhotos, groupedPhotos, updateObservations, currentObservation] );

  const onPermissionGranted = () => {
    setPermissionGranted( true );
  };

  useFocusEffect(
    React.useCallback( () => {
      // This will run when the screen comes into focus.
      let interactionHandle = null;

      // Wait for screen to finish transition
      interactionHandle = InteractionManager.runAfterInteractions( () => {
        if ( permissionGranted && !photoGalleryShown ) {
          showPhotoGallery();
        }
      } );

      return () => {
        // This runs when the screen goes out of focus
        if ( interactionHandle ) {
          interactionHandle.cancel();
        }
      };
    }, [permissionGranted, photoGalleryShown, showPhotoGallery] )
  );

  return (
    <View className="flex-1 w-full h-full justify-center items-center">
      <ActivityIndicator size={100} color={colors.inatGreen} />
      {!permissionGranted && (
        <PermissionGateContainer
          permissions={READ_MEDIA_PERMISSIONS}
          title={t( "Observe-and-identify-organisms-from-your-gallery" )}
          titleDenied={t( "Please-Allow-Gallery-Access" )}
          body={t( "Upload-photos-from-your-gallery-and-create-observations" )}
          blockedPrompt={t( "Youve-previously-denied-gallery-permissions" )}
          buttonText={t( "CHOOSE-PHOTOS" )}
          icon="gallery"
          image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
          onPermissionGranted={onPermissionGranted}
        />
      )}
    </View>
  );
};

export default PhotoGallery;
