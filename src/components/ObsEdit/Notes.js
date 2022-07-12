// @flow

import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import type { Node } from "react";
import { t } from "i18next";
import { TextInput } from "react-native-paper";

import { textStyles } from "../../styles/obsEdit/notes";
import { colors } from "../../styles/global";

type Props = {
  addNotes: Function,
  description: ?string
}

const Notes = ( { addNotes, description }: Props ): Node => {
  const [keyboardOffset, setKeyboardOffset] = useState( 0 );

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", ( e ) => {
      setKeyboardOffset( e.endCoordinates.height );
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", ( e ) => {
      setKeyboardOffset( 0 );
    } );

    return ( ) => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [] );

  const offset = {
    bottom: keyboardOffset,
    position: "absolute",
    zIndex: 1,
    width: "90%",
    backgroundColor: colors.white
  };

  return (
    <TextInput
      keyboardType="default"
      multiline
      onChangeText={addNotes}
      value={description}
      placeholder={t( "Add-optional-notes" )}
      style={[textStyles.notes, keyboardOffset > 0 && offset]}
      testID="ObsEdit.notes"
      underlineColor={colors.white}
    />
  );
};

export default Notes;
