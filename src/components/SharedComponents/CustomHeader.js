// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import colors from "colors";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  headerText?: string,
  hideRightIcon?: boolean,
  rightIcon?: any
}

const CustomHeader = ( {
  headerText, hideRightIcon, rightIcon
}: Props ): Node => {
  const navigation = useNavigation( );
  const navBack = ( ) => navigation.goBack( );

  return (
    <View className="flex-row justify-between items-center">
      <HeaderBackButton onPress={navBack} tintColor={colors.black} />
      {headerText && <Text className="text-xl">{headerText}</Text>}
      {!hideRightIcon && rightIcon}
    </View>
  );
};

export default CustomHeader;
