// @flow

import {
  INatIconButton
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel: string,
  backgroundColor?: string,
  children?: any,
  color?: string,
  disabled?: boolean,
  height?: number,
  icon: string,
  mode?: "contained",
  onPress: Function,
  rotating: ?boolean,
  size?: number,
  style?: Object,
  testID?: string,
  width?: number,
}

const RotatingINatIconButton = ( {
  accessibilityHint,
  accessibilityLabel,
  backgroundColor,
  children,
  color,
  disabled,
  height,
  icon,
  mode,
  onPress,
  rotating,
  size,
  style,
  testID,
  width
}: Props ): Node => {
  const rotation = useSharedValue( 0 );

  const animatedStyles = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: `-${rotation.value}deg`
        }
      ]
    } ),
    [rotation.value]
  );

  const getRotationAnimation = toValue => withDelay(
    500,
    withTiming( toValue, {
      duration: 1000,
      easing: Easing.linear
    } )
  );

  useEffect( () => {
    const cleanup = () => {
      cancelAnimation( rotation );
      rotation.value = 0;
    };

    if ( rotating ) {
      rotation.value = withRepeat(
        withSequence(
          getRotationAnimation( 180 ),
          getRotationAnimation( 360 ),
          withTiming( 0, { duration: 0 } )
        ),
        -1
      );
    } else {
      cleanup();
    }

    return cleanup;
  }, [rotating, rotation] );

  return (
    <Animated.View
      style={animatedStyles}
    >
      <INatIconButton
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        backgroundColor={backgroundColor}
        color={color}
        disabled={disabled}
        height={height}
        icon={icon}
        mode={mode}
        onPress={onPress}
        rotating={rotating}
        size={size}
        style={style}
        testID={testID}
        width={width}
      >
        { children }
      </INatIconButton>
    </Animated.View>
  );
};

export default RotatingINatIconButton;
