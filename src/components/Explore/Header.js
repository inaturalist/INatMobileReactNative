// @flow

import {
  Body3, Body4,
  Button,
  INatIcon, INatIconButton, ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Surface, useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  region: Object,
  setShowExploreBottomSheet: Function,
  exploreViewButtonText: string
}

const Header = ( { region, setShowExploreBottomSheet, exploreViewButtonText }: Props ): Node => {
  const theme = useTheme( );

  const surfaceStyle = {
    backgroundColor: theme.colors.onPrimary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  };

  const displayCommonName = ( ) => "Birds";
  const displayScientificName = ( ) => "Aves";

  return (
    <View className="z-10 top-0 absolute w-full">
      <Surface
        style={surfaceStyle}
        className="h-[230px]"
        elevation={5}
      >
        <View className="top-[65px] mx-5">
          <View className="flex-row justify-between pb-5 align-center">
            <Button
              text={exploreViewButtonText}
              className="shrink"
              dropdown
              onPress={( ) => setShowExploreBottomSheet( true )}
            />
            <View className="bg-darkGray rounded-full h-[46px] w-[46px]">
              <INatIconButton
                icon="label"
                color={colors.white}
                className="self-center"
              />
            </View>
          </View>
          <View className="flex-row mb-4">
            <INatIcon name="label-outline" size={15} />
            <View>
              <Body3
                className="text-darkGray ml-[8px]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayCommonName( )}
              </Body3>
              <Body4
                className="text-darkGray ml-[8px]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayScientificName( )}
              </Body4>
            </View>
          </View>
          <ObservationLocation
            observation={region}
            large
          />
          <View className="absolute right-0 bg-darkGray rounded-full" />
          <View className="absolute right-0 top-20 bg-darkGray rounded-md">
            <INatIconButton
              icon="sliders"
              color={colors.white}
            />
          </View>
        </View>
      </Surface>
    </View>
  );
};

export default Header;
