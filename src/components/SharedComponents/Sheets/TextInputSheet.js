// @flow

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

  type Props = {
    handleClose: Function,
    confirm: Function,
    initialInput?: ?string,
    placeholder: string,
    headerText: string,
    snapPoints: Array<Object>
  }

const TextInputSheet = ( {
  handleClose,
  confirm,
  initialInput = null,
  placeholder,
  headerText,
  snapPoints
}: Props ): Node => {
  const textInputRef = useRef( );
  const theme = useTheme( );
  const [input, setInput] = useState( initialInput );
  const { t } = useTranslation( );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      snapPoints={snapPoints}
      onChange={position => {
        if ( position === -1 ) {
          handleClose();
        }
      }}
    >
      <View className="p-5">
        <BottomSheetTextInput
          ref={textInputRef}
          accessibilityLabel="Text input field"
          keyboardType="default"
          multiline
          onChangeText={text => setInput( text )}
          placeholder={placeholder}
          testID="ObsEdit.notes"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            height: 223,
            fontFamily: `Whitney-Light${Platform.OS === "ios"
              ? ""
              : "-Pro"}`,
            fontSize: 14,
            lineHeight: 17,
            color: theme.colors.primary,
            borderRadius: 8,
            borderColor: colors.lightGray,
            borderWidth: 1,
            padding: 15,
            textAlignVertical: "top"
          }}
          autoFocus
          defaultValue={input}
        />
        <Body3
          className="z-50 absolute bottom-20 right-5 p-5"
          onPress={() => {
            textInputRef?.current?.clear();
          }}
        >
          {t( "Clear" )}
        </Body3>
        <Button
          testID="ObsEdit.confirm"
          className="mt-5"
          level="primary"
          text={t( "CONFIRM" )}
          onPress={() => {
            confirm( input );
            handleClose();
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default TextInputSheet;
