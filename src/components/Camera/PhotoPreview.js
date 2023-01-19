// @flow

import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import DeletePhotoDialog from "components/SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  savingPhoto: boolean
}

const PhotoPreview = ( {
  photoUris,
  setPhotoUris,
  savingPhoto
}: Props ): Node => {
  const { deletePhotoFromObservation } = useContext( ObsEditContext );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const [photoUriToDelete, setPhotoUriToDelete] = useState( null );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleSelection = photoUri => {
    setInitialPhotoSelected( photoUri );
    showModal( );
  };

  const showDialog = ( ) => setDeleteDialogVisible( true );

  const hideDialog = ( ) => {
    setPhotoUriToDelete( null );
    setDeleteDialogVisible( false );
  };

  const handleDelete = photoUri => {
    setPhotoUriToDelete( photoUri );
    showDialog( );
  };

  const emptyDescription = ( ) => (
    <Text className="text-white text-xl mt-20 ml-3">
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );

  const deletePhoto = ( ) => {
    deletePhotoFromObservation( photoUriToDelete, photoUris, setPhotoUris );
    hideDialog( );
  };

  // const [rotation, setRotation] = useState( false );

  // useEffect( () => {
  //   Dimensions.addEventListener( "change", ( { window: { width, height } } ) => {
  //     if ( !isTablet && width > height ) {
  //       // change image rotation
  //       setRotation( true );
  //       console.log( "rotation true" );
  //     } else if ( !isTablet && width < height ) {
  //       // change image rotation
  //       setRotation( false );
  //       console.log( "rotation false" );
  //     }
  //   } );
  // }, [] );

  return (
    <>
      <DeletePhotoDialog
        deleteDialogVisible={deleteDialogVisible}
        deletePhoto={deletePhoto}
        hideDialog={hideDialog}
      />
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
        initialPhotoSelected={initialPhotoSelected}
        photoUris={photoUris}
        setPhotoUris={setPhotoUris}
      />
      <View className="bg-black h-32">
        <PhotoCarousel
          photoUris={photoUris}
          emptyComponent={emptyDescription}
          containerStyle="camera"
          handleDelete={handleDelete}
          setSelectedPhotoIndex={handleSelection}
          savingPhoto={savingPhoto}
          // rotation={rotation}
        />
      </View>
    </>
  );
};

export default PhotoPreview;
