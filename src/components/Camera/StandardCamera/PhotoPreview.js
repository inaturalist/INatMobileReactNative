// @flow
import classnames from "classnames";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

import PhotoCarousel, {
  LARGE_PHOTO_DIM,
  LARGE_PHOTO_GUTTER,
  SMALL_PHOTO_DIM,
  SMALL_PHOTO_GUTTER
} from "./PhotoCarousel";

type Props = {
  rotation?: {
    value: number
  },
  isLandscapeMode?: boolean,
  isLargeScreen?: boolean,
  isTablet?: boolean,
  takingPhoto: boolean,
  cameraPreviewUris: Function,
  deletePhotoFromObservation: Function,
  setPhotoEvidenceUris: Function
}

const STYLE = {
  justifyContent: "center",
  flex: 0,
  flexShrink: 1
};

const PhotoPreview = ( {
  isLandscapeMode,
  isLargeScreen,
  isTablet,
  rotation,
  takingPhoto,
  cameraPreviewUris,
  deletePhotoFromObservation,
  setPhotoEvidenceUris
}: Props ): Node => {
  const { t } = useTranslation( );
  const wrapperDim = isLargeScreen
    ? LARGE_PHOTO_DIM + LARGE_PHOTO_GUTTER * 2
    : SMALL_PHOTO_DIM + SMALL_PHOTO_GUTTER * 2;

  let noPhotosNotice = (
    <Text
      className={classnames(
        "text-white",
        "text-center",
        "text-xl",
        "w-full"
      )}
    >
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );
  if ( isTablet && isLandscapeMode ) {
    noPhotosNotice = (
      <Text
        className={classnames(
          "text-white",
          "text-center",
          "text-xl",
          "absolute",
          "w-[500px]",
          "-rotate-90",
          "left-[-190px]",
          "top-[50%]"
        )}
      >
        {t( "Photos-you-take-will-appear-here" )}
      </Text>
    );
  }

  const dynamicStyle = {};
  if ( isTablet && isLandscapeMode ) {
    dynamicStyle.width = wrapperDim;
  } else {
    dynamicStyle.height = wrapperDim;
    dynamicStyle.width = "100%";
  }

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[STYLE, dynamicStyle]}
    >
      {
        cameraPreviewUris.length === 0 && !takingPhoto
          ? noPhotosNotice
          : (
            <PhotoCarousel
              deletePhoto={deletePhotoFromObservation}
              photoUris={cameraPreviewUris}
              rotation={rotation}
              setPhotoEvidenceUris={setPhotoEvidenceUris}
              takingPhoto={takingPhoto}
              isLargeScreen={isLargeScreen}
              isTablet={isTablet}
              isLandscapeMode={isLandscapeMode}
            />
          )
      }
    </View>
  );
};

export default PhotoPreview;
