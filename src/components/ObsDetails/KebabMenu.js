// @flow

import React, { useState } from "react";
import type { Node } from "react";
import { Button, Menu, Provider, DefaultTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Realm from "realm";

import { viewStyles } from "../../styles/obsDetails/obsDetails";
import Comment from "../../models/Comment";
import realmConfig from "../../models/index";

type Props = {
  uuid: string,
  toggleRefetch: Function
}

const KebabMenu = ( { uuid, toggleRefetch }: Props ): Node => {
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );

  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  return (
    <Provider theme={DefaultTheme}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        style={viewStyles.kebabMenuPlacement}
        anchor={
          <Button onPress={openMenu} icon="dots-horizontal" color="#999999" />
        }>
        <Menu.Item
          onPress={async ( ) => {
            const realm = await Realm.open( realmConfig );
            Comment.deleteComment( uuid, realm );
            toggleRefetch( );
          }}
          title={t( "Delete-comment" )}
        />
      </Menu>
    </Provider>
  );
};

export default KebabMenu;
