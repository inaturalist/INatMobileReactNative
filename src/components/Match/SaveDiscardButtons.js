import {
  ButtonBar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2
} );

type Props = {
  handlePress: Function
}

const SaveDiscardButtons = ( {
  handlePress
}: Props ): Node => {
  const { t } = useTranslation( );

  const saveButton = {
    title: t( "SAVE" ),
    onPress: ( ) => handlePress( "save" ),
    isPrimary: true,
    testID: "MatchScreen.saveButton",
    level: "focus",
    className: "ml-3 grow"
  };

  const discardButton = {
    title: t( "DISCARD" ),
    onPress: ( ) => handlePress( "discard" ),
    isPrimary: false,
    testID: "MatchScreen.discardButton",
    level: "neutral",
    className: "px-[15px]"
  };

  const buttonConfiguration = [discardButton, saveButton];

  return (
    <View
      className="bg-white"
      style={DROP_SHADOW}
    >
      <ButtonBar
        buttonConfiguration={buttonConfiguration}
        containerClass="p-[20px]"
      />
    </View>
  );
};

export default SaveDiscardButtons;
