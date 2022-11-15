// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import Button from "components/SharedComponents/Buttons/Button";
import ScrollNoFooter from "components/SharedComponents/ScrollNoFooter";
import { Text, View } from "components/styledComponents";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useState
} from "react";
import { useTranslation } from "react-i18next";
import { BackHandler } from "react-native";
import Photo from "realmModels/Photo";
import useLocalObservation from "sharedHooks/useLocalObservation";
import useLoggedIn from "sharedHooks/useLoggedIn";
import { viewStyles } from "styles/obsEdit/obsEdit";

import AddEvidenceModal from "./AddEvidenceModal";
import EvidenceSection from "./EvidenceSection";
import IdentificationSection from "./IdentificationSection";
import ObsEditHeader from "./ObsEditHeader";
import OtherDataSection from "./OtherDataSection";

const { useRealm } = RealmContext;

const ObsEdit = ( ): Node => {
  const {
    currentObservation,
    observations,
    saveObservation,
    saveAndUploadObservation,
    setObservations,
    resetObsEditContext
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];

  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { t } = useTranslation( );
  const localObservation = useLocalObservation( params?.uuid );

  useEffect( ( ) => {
    // when opening an observation from ObsDetails, fetch the local
    // observation from realm
    if ( localObservation && !currentObservation ) {
      resetObsEditContext( );
      setObservations( [localObservation] );
    }
  }, [localObservation, setObservations, resetObsEditContext, currentObservation] );

  const isLoggedIn = useLoggedIn( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );

  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleBackButtonPress = useCallback( async ( ) => {
    setObservations( [] );
    navigation.goBack( );
  }, [navigation, setObservations] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  const realm = useRealm( );

  const setPhotos = uris => {
    const updatedObservations = observations;
    const updatedObsPhotos = Array.from( currentObservation.observationPhotos )
      .filter( obsPhoto => {
        const { photo } = obsPhoto;
        if ( uris.includes( photo.url || photo.localFilePath ) ) {
          return obsPhoto;
        }
        return false;
      } );
    // when updatedObsPhotos is an empty array, Realm apparently writes to the
    // db immediately when you assign, so if you don't do this in write
    // callback it raises an exception
    realm?.write( ( ) => {
      currentObservation.observationPhotos = updatedObsPhotos;
    } );
    setObservations( [...updatedObservations] );
  };

  const handleSelection = photo => {
    setInitialPhotoSelected( photo );
    showModal( );
  };

  const addEvidence = ( ) => setShowAddEvidenceModal( true );

  if ( !currentObservation ) { return null; }

  return (
    <>
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
      >
        <MediaViewer
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotos}
          hideModal={hideModal}
        />
      </MediaViewerModal>
      <ScrollNoFooter style={mediaViewerVisible && viewStyles.mediaViewerSafeAreaView}>
        <ObsEditHeader handleBackButtonPress={handleBackButtonPress} />
        <Text className="text-2xl ml-4">{t( "Evidence" )}</Text>
        <EvidenceSection
          handleSelection={handleSelection}
          photoUris={photoUris}
          handleAddEvidence={addEvidence}
        />
        <Text className="text-2xl ml-4 mt-4">{t( "Identification" )}</Text>
        <IdentificationSection />
        <Text className="text-2xl ml-4">{t( "Other-Data" )}</Text>
        <OtherDataSection />
        <View style={viewStyles.buttonRow}>
          <Button
            onPress={saveObservation}
            testID="ObsEdit.saveButton"
            text={t( "SAVE" )}
            level="neutral"

          />
          <Button
            level="primary"
            text="UPLOAD-OBSERVATION"
            testID="ObsEdit.uploadButton"
            onPress={saveAndUploadObservation}
            disabled={!isLoggedIn}
          />
        </View>
        <AddEvidenceModal
          showAddEvidenceModal={showAddEvidenceModal}
          setShowAddEvidenceModal={setShowAddEvidenceModal}
          photoUris={photoUris}
        />
      </ScrollNoFooter>
    </>
  );
};

export default ObsEdit;
