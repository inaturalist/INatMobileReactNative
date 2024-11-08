import React from "react";
import RealmObservation from "realmModels/Observation";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";
import ObsPressable from "./ObsPressable";

// TODO remove when we figure out how to type the Realm models
interface Observation extends RealmObservation {
  uuid: string;
}

type Props = {
  queued: boolean,
  explore: boolean,
  onUploadButtonPress: ( ) => void,
  onItemPress: ( ) => void,
  gridItemStyle: Object,
  layout: "list" | "grid",
  observation: Observation,
  obsListKey: string,
  uploadProgress: number,
  unsynced: boolean
};

const ObsPressableContainer = ( {
  queued,
  explore,
  onUploadButtonPress,
  onItemPress,
  gridItemStyle,
  layout,
  observation,
  obsListKey,
  uploadProgress,
  unsynced
}: Props ) => (
  <ObsPressable
    observation={observation}
    obsListKey={obsListKey}
    testID={`ObsPressable.${observation.uuid}`}
    queued={queued}
    unsynced={unsynced}
    onItemPress={onItemPress}
  >
    {
      layout === "grid"
        ? (
          <ObsGridItem
            explore={explore}
            onUploadButtonPress={onUploadButtonPress}
            observation={observation}
            queued={queued}
            // 03022023 it seems like Flatlist is designed to work
            // better with RN styles than with Tailwind classes
            style={gridItemStyle}
            uploadProgress={uploadProgress}
          />
        )
        : (
          <ObsListItem
            explore={explore}
            onUploadButtonPress={onUploadButtonPress}
            observation={observation}
            queued={queued}
            uploadProgress={uploadProgress}
            unsynced={unsynced}
          />
        )
    }
  </ObsPressable>
);

export default ObsPressableContainer;
