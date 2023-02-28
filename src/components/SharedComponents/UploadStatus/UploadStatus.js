// @flow

import INatIcon from "components/SharedComponents/INatIcon";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated, Easing } from "react-native";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { useTheme } from "react-native-paper";

type Props = {
  color?: string,
  completeColor?: string,
  progress: number
}

const UploadStatus = ( { color, completeColor, progress }: Props ): Node => {
  const theme = useTheme();
  const defaultColor = theme.colors.primary;
  const defaultCompleteColor = theme.colors.secondary;
  const rotateAnimation = new Animated.Value( 0 );

  Animated.loop(
    Animated.timing( rotateAnimation, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: true
    } )
  ).start( () => {
    rotateAnimation.setValue( 0 );
  } );

  const interpolateRotating = rotateAnimation.interpolate( {
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  } );

  const rotate = {
    transform: [
      {
        rotate: interpolateRotating
      }
    ]
  };

  return (
    <View className="relative items-center justify-center w-[49px] h-[67px]">
      {( progress < 0.05 )
        ? (
          <>
            <Animated.View style={rotate}>
              <INatIcon name="dotted-outline" color={color || defaultColor} size={33} />
            </Animated.View>
            <View className="absolute">
              <INatIcon
                name="upload"
                color={color || defaultColor}
                size={15}
              />
            </View>
          </>
        )
        : (
          <>
            {( progress < 1 )
              ? (
                <View className="absolute">
                  <INatIcon
                    name="upload"
                    color={color || defaultColor}
                    size={15}
                  />
                </View>
              )
              : (
                <View className="absolute">
                  <INatIcon
                    name="icon-check-1"
                    color={completeColor || defaultCompleteColor}
                    size={15}
                  />
                </View>
              )}
            <CircularProgressBase
              testID="UploadStatus.CircularProgress"
              value={progress}
              radius={16.5}
              activeStrokeColor={( progress < 1 )
                ? ( color || defaultColor ) : ( completeColor || defaultCompleteColor )}
              showProgressValue={false}
              maxValue={1}
              inActiveStrokeOpacity={0}
              activeStrokeWidth={2}
            />
          </>
        )}
    </View>
  );
};
export default UploadStatus;
