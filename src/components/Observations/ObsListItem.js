// @flow
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsPreviewImage from "./ObsPreviewImage";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  onPress: Function,
};

const ObsListItem = ( { observation, onPress }: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );

  return (
    <Pressable
      onPress={( ) => onPress( observation )}
      className="flex-row my-2 px-[10px]"
      testID={`ObsList.obsListItem.${observation.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
    >
      <View className="relative w-[62px] h-[62px] rounded-lg mr-[10px] overflow-hidden">
        <ObsPreviewImage
          uri={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
          observation={observation}
          opaque={needsSync}
        />
      </View>
      <View className="shrink">
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={observation?.user?.prefers_scientific_name_first}
          layout="vertical"
        />
        <ObservationLocation observation={observation} />
        <DateDisplay dateTime={observation?._created_at} />
      </View>

      <View className="items-center justify-center ml-auto">
        {needsSync ? (
          <UploadButton observation={observation} />
        ) : (
          <ObsStatus observation={observation} layout="vertical" />
        )}
      </View>
    </Pressable>
  );
};

export default ObsListItem;
