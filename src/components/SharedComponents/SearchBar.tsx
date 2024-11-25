import { fontRegular } from "appConstants/fontFamilies.ts";
import classNames from "classnames";
import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Keyboard, TextInput as RNTextInput } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

interface Props {
  autoFocus?: boolean;
  clearSearch?: () => void;
  containerClass?: string;
  handleTextChange: ( _text: string ) => void;
  hasShadow?: boolean;
  input?: React.RefObject<RNTextInput>,
  placeholder?: string;
  testID?: string;
  value: string;
}

// Ensure this component is placed outside of scroll views

const SearchBar = ( {
  autoFocus = true,
  clearSearch,
  containerClass,
  handleTextChange,
  hasShadow,
  input,
  placeholder,
  testID,
  value
}: Props ) => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  const outlineStyle = {
    borderColor: "lightgray",
    borderRadius: 8,
    borderWidth: 1
  } as const;

  const style = {
    ...( hasShadow
      ? DROP_SHADOW
      : {} ),
    fontSize: 16,
    lineHeight: 18,
    paddingRight: 28
  } as const;

  // kind of tricky to change the font here:
  // https://github.com/callstack/react-native-paper/issues/3615#issuecomment-1402025033
  const fontTheme = {
    fonts: {
      bodyLarge:
        {
          ...theme.fonts.bodyLarge,
          fontFamily: fontRegular
        }
    }
  } as const;

  return (
    <View className={classNames( "flex justify-center", containerClass )}>
      <TextInput
        ref={input}
        accessibilityLabel={t( "Search-for-a-taxon" )}
        activeUnderlineColor={colors.darkGray}
        autoFocus={autoFocus}
        dense
        keyboardType="default"
        mode="outlined"
        onChangeText={handleTextChange}
        outlineStyle={outlineStyle}
        placeholder={placeholder}
        selectionColor={colors.darkGray}
        style={style}
        testID={testID}
        theme={fontTheme}
        underlineColor={colors.darkGray}
        value={value}
      />
      {value?.length > 0 && clearSearch
        ? (
          <View className="absolute right-0">
            <INatIconButton
              icon="close"
              accessibilityLabel={t( "Close-search" )}
              size={18}
              onPress={() => {
                Keyboard.dismiss();
                clearSearch();
              }}
            />
          </View>
        )
        : (
          <View className="absolute right-4 top-[15px]">
            <INatIcon name="magnifying-glass" size={18} />
          </View>
        )}
    </View>
  );
};

export default SearchBar;
