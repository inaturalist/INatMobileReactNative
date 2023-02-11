// @flow
import classnames from "classnames";
import { ImageBackground, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type URI = {
  uri: string,
};

type Props = {
  uri?: URI,
  observation?: Object,
  opaque?: boolean,
  width?: string,
  height?: string,
  multiplePhotosLocation?: "bottom" | "top",
  children?: Node,
  disableGradient?: boolean,
};

const ObsPreviewImage = ( {
  uri,
  observation,
  height = "h-[62px]",
  width = "w-[62px]",
  opaque = false,
  multiplePhotosLocation = "bottom",
  children,
  disableGradient = false
}: Props ): Node => {
  const theme = useTheme( );
  const obsPhotosCount = observation?.observationPhotos?.length ?? 0;
  const hasMultiplePhotos = obsPhotosCount > 1;
  const hasSound = !!observation?.observationSounds?.length;
  const filterIconName = obsPhotosCount > 9 ? "filter-9-plus" : `filter-${obsPhotosCount || 2}`;

  return (
    <View
      className={classnames(
        "relative w-[62px] h-[62px] rounded-lg mr-[10px] overflow-hidden",
        height,
        width
      )}
    >
      {uri ? (
        <ImageBackground
          source={uri}
          className={classnames( "grow aspect-square", { "opacity-50": opaque } )}
          testID="ObsList.photo"
        >
          {!disableGradient && (
            <LinearGradient
              className="bg-transparent absolute inset-0"
              colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
            />
          )}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
        >
          <View className="grow aspect-square" />
        </LinearGradient>
      )}
      {hasMultiplePhotos && (
        <View
          className={classnames( "absolute right-0", {
            "bottom-0 p-1": multiplePhotosLocation === "bottom",
            "top-0 p-2": multiplePhotosLocation === "top"
          } )}
        >
          <IconMaterial
            // $FlowIgnore
            name={filterIconName}
            color={theme.colors.onPrimary}
            size={22}
          />
        </View>
      )}
      {hasSound && (
        <IconMaterial
          name="volume-up"
          color={theme.colors.onPrimary}
          size={22}
        />
      )}
      {children}
    </View>
  );
};

export default ObsPreviewImage;
