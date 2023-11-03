// @flow

import { UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

import ObsStatus from "./ObsStatus";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  startUpload: Function,
  showUploadStatus: boolean,
  progress: number
};

const ObsUploadStatus = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  startUpload,
  showUploadStatus,
  progress
}: Props ): Node => {
  const theme = useTheme( );
  const whiteColor = white && theme.colors.onPrimary;

  const displayUploadStatus = ( ) => {
    const obsStatus = (
      <ObsStatus
        observation={observation}
        layout={layout}
        white={white}
        classNameMargin={classNameMargin}
        testID={`ObsStatus.${observation.uuid}`}
      />
    );

    if ( !showUploadStatus ) {
      return obsStatus;
    }

    return (
      <UploadStatus
        progress={progress}
        uploadObservation={startUpload}
        color={whiteColor}
        completeColor={whiteColor}
        layout={layout}
        uuid={observation.uuid}
      >
        {obsStatus}
      </UploadStatus>
    );
  };

  return displayUploadStatus( );
};

export default ObsUploadStatus;
