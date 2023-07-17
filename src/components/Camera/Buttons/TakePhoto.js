// @flow

import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  takePhoto: Function,
  disallowAddingPhotos?: boolean,
  showPrediction?: boolean
}

const TakePhoto = ( {
  takePhoto,
  disallowAddingPhotos,
  showPrediction
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  return (
    <Pressable
      className={classnames(
        "bg-white",
        "rounded-full",
        "h-[60px]",
        "w-[60px]",
        "justify-center",
        "items-center"
      )}
      onPress={takePhoto}
      accessibilityLabel={t( "Take-photo" )}
      accessibilityRole="button"
      accessibilityState={{ disabled: disallowAddingPhotos }}
      disabled={disallowAddingPhotos}
    >
      {showPrediction
        ? (
          <View
            style={getShadow( theme.colors.primary )}
            className={classnames(
              "border-[1.64px] rounded-full h-[49.2px] w-[49.2px]",
              "bg-inatGreen border-lightGray items-center justify-center"
            )}
          >
            <INatIcon
              name="sparkly-label"
              size={24}
              color={theme.colors.onPrimary}
            />
          </View>
        )
        : <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />}
    </Pressable>
  );
};

export default TakePhoto;
