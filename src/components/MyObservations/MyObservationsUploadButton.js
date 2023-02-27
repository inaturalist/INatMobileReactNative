// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  observation: Object
}

const MyObservationsUploadButton = ( { observation }: Props ): Node => {
  const obsEditContext = useContext( ObsEditContext );
  const uploadObservation = obsEditContext?.uploadObservation;
  const setLoading = obsEditContext?.setLoading;

  return (
    <IconButton
      size={40}
      icon="pencil"
      iconColor={colors.borderGray}
      onPress={async ( ) => {
        setLoading( true );
        await uploadObservation( observation );
        setLoading( false );
      }}
    />
  );
};

export default MyObservationsUploadButton;
