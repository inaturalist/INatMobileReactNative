// @flow

import classnames from "classnames";
import { DisplayTaxonName, INatIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type Props = {
  handlePress: Function,
  taxon: Object,
  testID?: string,
  accessibilityLabel?: string,
  withdrawn?: boolean
}

const DisplayTaxon = ( {
  handlePress, taxon, testID, accessibilityLabel, withdrawn
}: Props ): Node => {
  const realm = useRealm( );
  const { t } = useTranslation( );

  const imageClassName = "w-[62px] h-[62px] rounded-lg";

  const iconicTaxonName = taxon?.isIconic
    ? taxon.name
    : taxon?.iconic_taxon_name;

  const iconicTaxon = iconicTaxonName && realm?.objects( "Taxon" )
    .filtered( "name CONTAINS[c] $0", iconicTaxonName );

  const taxonPhoto = taxon?.default_photo?.url || iconicTaxon?.[0]?.default_photo?.url;

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center shrink"
      onPress={handlePress}
      testID={testID}
      accessibilityLabel={accessibilityLabel || t( "Taxon-photo-and-name" )}
    >
      {taxonPhoto
        ? (
          <Image
            source={{ uri: taxonPhoto }}
            className={classnames(
              imageClassName,
              {
                "opacity-50": withdrawn
              }
            )}
            accessibilityIgnoresInvertColors
            testID="DisplayTaxon.image"
          />
        )
        : (
          <View className={classnames(
            imageClassName,
            "justify-center items-center"
          )}
          >
            <INatIcon
              name={`iconic-${iconicTaxonName?.toLowerCase( )}`}
              size={22}
            />
          </View>
        )}
      <View className="ml-3 shrink">
        <DisplayTaxonName taxon={taxon} withdrawn={withdrawn} />
      </View>
    </Pressable>
  );
};

export default DisplayTaxon;
