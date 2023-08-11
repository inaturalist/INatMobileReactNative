// @flow
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
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
  containerClass?: string,
  handleTextChange: Function,
  value: string,
  testID?: string,
  hasShadow?: boolean,
  input?: any
}

// Ensure this component is placed outside of scroll views

const SearchBar = ( {
  containerClass,
  testID,
  handleTextChange,
  value,
  hasShadow,
  input
}: Props ): Node => {
  const theme = useTheme( );

  return (
    <View className={containerClass}>
      <TextInput
        ref={input}
        accessibilityLabel="Search bar"
        keyboardType="default"
        mode="outlined"
        onChangeText={handleTextChange}
        value={value}
        // eslint-disable-next-line react-native/no-inline-styles
        outlineStyle={{
          borderColor: "lightgray",
          borderRadius: 8,
          borderWidth: 1
        }}
        testID={testID}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: 45,
          ...( hasShadow
            ? getShadow( theme.colors.primary )
            : {} ),
          paddingRight: 28
        }}
        underlineColor={theme.colors.primary}
        activeUnderlineColor={theme.colors.primary}
        // kind of tricky to change the font here:
        // https://github.com/callstack/react-native-paper/issues/3615#issuecomment-1402025033
        theme={{
          fonts: {
            bodyLarge:
              {
                ...theme.fonts.bodyLarge,
                fontFamily: `Whitney-Light${Platform.OS === "ios"
                  ? ""
                  : "-Pro"}`
              }
          }
        }}
      />
      <View className="absolute right-4 top-[20px]">
        <INatIcon name="magnifying-glass" size={18} />
      </View>
    </View>
  );
};

export default SearchBar;
