// @flow strict-local

import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import colors from "styles/tailwindColors";

type Props = {
  takingPhoto: boolean
}

const fade = value => ( {
  toValue: value,
  duration: 100,
  useNativeDriver: true
} );

const FadeInOutView = ( { takingPhoto }: Props ): Node => {
  const fadeAnimation = useRef( new Animated.Value( 0 ) ).current;

  useEffect( ( ) => {
    if ( takingPhoto ) {
      Animated.sequence( [
        Animated.timing( fadeAnimation, fade( 1 ) ),
        Animated.timing( fadeAnimation, fade( 0 ) )
      ] ).start( );
    }
  }, [takingPhoto, fadeAnimation] );

  return (
    <Animated.View
      pointerEvents="none"
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        backgroundColor: colors.black,
        opacity: fadeAnimation
      }}
    />
  );
};

export default FadeInOutView;
