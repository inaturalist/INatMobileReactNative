// @flow
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useIconicTaxa } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  taxon: Object,
  before: any,
  onTaxonChosen: Function
};

const IconicTaxonChooser = ( { taxon, before, onTaxonChosen }: Props ): Node => {
  const [selectedIcon, setSelectedIcon] = useState( null );
  const iconicTaxa = useIconicTaxa( { reload: false } );
  const isIconic = taxon?.id && iconicTaxa.filtered( `id = ${taxon?.id}` );

  const iconicTaxonIcons = [
    "plantae",
    "insecta",
    "aves",
    "animalia",
    "fungi",
    "arachnida",
    "mollusica",
    "mammalia",
    "reptilia",
    "amphibia",
    "actinopterygii",
    "chromista",
    "protozoa",
    "unknown"
  ];

  useEffect( ( ) => {
    if ( !isIconic ) { return; }
    setSelectedIcon( taxon.name.toLowerCase( ) );
  }, [isIconic, taxon] );

  const renderIcon = ( { item } ) => {
    const isSelected = selectedIcon === item;
    return (
      <View
        className={
          classnames(
            "border-darkGray border border-[2px] mr-4 justify-center items-center",
            "h-[36px] w-[36px] rounded-full",
            {
              "bg-darkGray": isSelected
            }
          )
        }
        accessibilityRole="radio"
        accessibilityState={{
          selected: isSelected
        }}
        testID={`IconicTaxonButton.${item}`}
      >
        <INatIconButton
          icon={`iconic-${item}`}
          size={22}
          onPress={( ) => {
            setSelectedIcon( item );
            onTaxonChosen( item );
          }}
          color={isSelected && colors.white}
        />
      </View>
    );
  };

  const renderHeader = ( ) => {
    if ( before ) {
      return (
        <View className="mr-4">
          {before}
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={iconicTaxonIcons}
      horizontal
      renderItem={renderIcon}
      showsHorizontalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      accessibilityRole="radiogroup"
    />
  );
};

export default IconicTaxonChooser;
