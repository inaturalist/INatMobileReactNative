// @flow

import TransparentCircleButton from "components/SharedComponents/Buttons/TransparentCircleButton";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  flipCamera: Function,
  cameraFlipClasses?: string
}

const CameraFlip = ( {
  flipCamera,
  cameraFlipClasses
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <TransparentCircleButton
      optionalClasses={cameraFlipClasses}
      onPress={flipCamera}
      accessibilityLabel={t( "Camera-button-label-switch-camera" )}
      icon="rotate"
    />
  );
};

export default CameraFlip;
