import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Image } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import {
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  color?: string,
  onPress?: Function,
  inCustomHeader?: boolean,
  customStyles?: Object,
  testID?: string
}

// styling lifted from
// https://github.com/react-navigation/react-navigation/blob/395410a7a751492ad846c7723dd33b55891173e1/packages/elements/src/Header/HeaderBackButton.tsx
const REACT_NAVIGATION_BACK_BUTTON_STYLES = {
  container: {
    ...Platform.select( {
      ios: {
        paddingLeft: 8,
        paddingRight: 22
      },
      default: {
        paddingVertical: 3,
        paddingHorizontal: 11
      }
    } )
  },
  icon: Platform.select( {
    ios: {
      height: 21,
      width: 13
    }
  } )
};

const BackButton = ( {
  color = colors.black,
  onPress,
  inCustomHeader,
  customStyles,
  testID = "BackButton"
}: Props ): Node => {
  const navigation = useNavigation();
  const tintColor = color || colors.black;
  const { t } = useTranslation( );

  const imageStyles = [
    !inCustomHeader && REACT_NAVIGATION_BACK_BUTTON_STYLES.icon,
    Boolean( tintColor ) && { tintColor },
    customStyles
  ];

  const backImage = ( ) => (
    <Image
      accessibilityLabel={t( "Go-back" )}
      accessibilityIgnoresInvertColors
      fadeDuration={0}
      resizeMode="contain"
      source={require( "images/backIcons/back-icon.png" )}
      style={imageStyles}
      testID="Image.BackButton"
    />
  );

  if ( navigation?.canGoBack( ) ) {
    return (
      <HeaderBackButton
        backImage={backImage}
        labelVisible={false}
        onPress={onPress || navigation.goBack}
        style={REACT_NAVIGATION_BACK_BUTTON_STYLES.container}
        testID={testID}
        tintColor={tintColor}
      />
    );
  }

  return null;
};

export default BackButton;
