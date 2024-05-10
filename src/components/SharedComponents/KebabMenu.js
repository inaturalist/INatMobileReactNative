// @flow

import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { Node } from "react";
import React from "react";
import { Pressable } from "react-native";
import { Menu } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  // $FlowIgnore
  children: unknown,
  large?: boolean,
  setVisible: Function,
  visible: boolean,
  white?: boolean,
}
import Body3 from "./Typography/Body3";

const KebabMenu = ( {
  accessibilityHint,
  accessibilityLabel,
  children,
  large,
  setVisible,
  visible,
  white
}: Props ): Node => {
  const { t } = useTranslation( );
  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  const menuContentStyle = {
    backgroundColor: colors.white
  };

  const anchorButton = (
    <INatIconButton
      onPress={openMenu}
      icon="kebab-menu"
      testID="KebabMenu.Button"
      size={large
        ? 26
        : 15}
      accessibilityLabel={accessibilityLabel || t( "Menu" )}
      accessibilityHint={accessibilityHint || t( "Open-menu" )}
      color={white
        ? colors.white
        : colors.black}
    />
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={menuContentStyle}
      anchor={anchorButton}
    >
      {children}
    </Menu>
  );
};

const KebabMenuItem = ( {
  accessibilityLabel,
  onPress,
  testID,
  title
} ) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || title}
    onPress={onPress}
  >
    <Body3
      className="m-[14px] text-black"
    >
      {title}
    </Body3>
  </Pressable>
);

KebabMenu.Item = KebabMenuItem;

export default KebabMenu;
