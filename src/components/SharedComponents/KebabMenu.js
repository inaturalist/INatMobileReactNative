// @flow

import { tailwindFontMedium } from "appConstants/fontFamilies.ts";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton.tsx";
import type { Node } from "react";
import React from "react";
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

const FIRST_MENU_ITEM_STYLE = {
  padding: 14
};

const MENU_ITEM_STYLE = {
  ...FIRST_MENU_ITEM_STYLE,
  borderTopColor: colors.lightGray,
  borderTopWidth: 1
};

const MENU_CONTENT_STYLE = {
  backgroundColor: colors.white,
  borderRadius: 8,
  // Negative padding gets rid of extra padding rn-paper seems to add
  paddingTop: -10,
  paddingBottom: -10,
  // Not ideal, but seems to work in most situations to get the menu to appear
  // below the button that opens it
  top: 40
};

// Should be the same as Body3, we just can't use that component *and* get all
// the advantages of Menu.Item, hence the custom style
const MENU_ITEM_TITLE_STYLE = {
  fontSize: 13,
  fontFamily: tailwindFontMedium,
  lineHeight: 18,
  color: colors.darkGray
};

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

  const anchorButton = (
    <INatIconButton
      onPress={openMenu}
      icon="kebab-menu"
      testID="KebabMenu.Button"
      size={large
        ? 28
        : 15}
      accessibilityLabel={accessibilityLabel || t( "Menu" )}
      accessibilityHint={accessibilityHint || t( "Open-menu" )}
      color={white
        ? colors.white
        : colors.darkGray}
    />
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={MENU_CONTENT_STYLE}
      anchor={anchorButton}
    >
      {children}
    </Menu>
  );
};

type KebabMenuItemProps = {
  accessibilityLabel?: string,
  isFirst?: boolean,
  onPress: Function,
  testID?: string,
  title: string
}
const KebabMenuItem = ( {
  accessibilityLabel,
  isFirst,
  onPress,
  testID,
  title
}: KebabMenuItemProps ): Node => (
  <Menu.Item
    accessibilityLabel={accessibilityLabel}
    testID={testID}
    onPress={onPress}
    style={
      isFirst
        ? FIRST_MENU_ITEM_STYLE
        : MENU_ITEM_STYLE
    }
    titleStyle={MENU_ITEM_TITLE_STYLE}
    title={title}
  />
);

KebabMenu.Item = KebabMenuItem;

export default KebabMenu;
