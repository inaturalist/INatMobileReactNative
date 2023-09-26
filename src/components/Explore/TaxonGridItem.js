// @flow

import { DisplayTaxonName } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import SpeciesSeenCheckmark from "./SpeciesSeenCheckmark";

type Props = {
  taxon: Object,
  width?: string,
  height?: string,
  style?: Object
};

const ObsGridItem = ( {
  taxon,
  width = "w-full",
  height,
  style
}: Props ): Node => (
  <ObsImagePreview
    source={{
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        taxon?.default_photo
      )
    }}
    width={width}
    height={height}
    style={style}
    isMultiplePhotosTop
    testID={`TaxonGridItem.${taxon.id}`}
    iconicTaxonName={taxon.iconic_taxon_name}
  >
    <SpeciesSeenCheckmark
      taxonId={taxon.id}
    />
    <View className="absolute bottom-0 flex p-2 w-full">
      <DisplayTaxonName
        keyBase={taxon?.id}
        taxon={taxon}
        layout="vertical"
        color="text-white"
      />
    </View>
  </ObsImagePreview>
);

export default ObsGridItem;
