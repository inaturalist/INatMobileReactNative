// @flow

import {
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { TextInput, useTheme } from "react-native-paper";

type Props = {
  accessibilityLabel: string,
  autoComplete?: string,
  headerText: string,
  keyboardType?: string,
  onChangeText: Function,
  secureTextEntry?: boolean,
  testID: string,
  textContentType?: string,
  value: string
}

const LoginSignUpInputField = ( {
  accessibilityLabel,
  autoComplete,
  headerText,
  keyboardType,
  onChangeText,
  secureTextEntry = false,
  testID,
  textContentType,
  value
}: Props ): Node => {
  const theme = useTheme( );

  return (
    <View className="mx-2">
      <Heading4 className="color-white mt-[25px] mb-[11px]">
        {headerText}
      </Heading4>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoComplete={autoComplete}
        className="h-[45px] rounded-md"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        selectionColor={theme.colors.tertiary}
        testID={testID}
        textContentType={textContentType}
        value={value}
      />
    </View>
  );
};

export default LoginSignUpInputField;
