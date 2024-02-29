import { useNavigation } from "@react-navigation/native";
import {
  Heading4,
  INatIconButton,
  ScrollViewWrapper
} from "components/SharedComponents";
import {
  fontMonoClass,
  Text,
  TextInput,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect
} from "react";
import { Platform } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useLogs from "sharedHooks/useLogs";

/* eslint-disable i18next/no-literal-string */
const Log = (): Node => {
  const navigation = useNavigation( );
  const { emailLogFile, shareLogFile, logContents } = useLogs( );
  const headerRight = useCallback( ( ) => (
    <>
      { Platform.OS === "ios" && (
        <View className="mr-3">
          <INatIconButton
            icon="share"
            onPress={shareLogFile}
            accessibilityLabel="Email logs"
            accessibilityHint="Opens email app"
            color="white"
          />
        </View>
      ) }
      <IconMaterial
        name="mail"
        size={24}
        onPress={emailLogFile}
        accessibilityLabel="Email logs"
        accessibilityHint="Opens email app"
        color="white"
      />
    </>
  ), [emailLogFile, shareLogFile] );
  useEffect(
    ( ) => navigation.setOptions( { headerRight } ),
    [headerRight, navigation]
  );

  const lines = logContents.split( "\n" );
  const content = lines.slice( lines.length - 1000, lines.length ).join( "\n" );

  return (
    <ScrollViewWrapper>
      <View className="p-5">
        { lines.length > 1000 && (
          <Heading4>Last 1000 lines of log</Heading4>
        ) }
        {Platform.OS === "ios"
          ? (
            // iOS requires a TextInput for word selections
            // https://github.com/facebook/react-native/issues/13938#issuecomment-520590673
            <TextInput
              accessibilityLabel="Text input field"
              value={content}
              editable={false}
              multiline
            />
          )
          : (
            // Android can do word selections just with <Text>
            <Text className={`text-xs h-fit mb-5 ${fontMonoClass}`} selectable>{content}</Text>
          )}
      </View>
    </ScrollViewWrapper>
  );
};

export default Log;
