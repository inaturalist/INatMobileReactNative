// @flow
import { INatIconButton } from "components/SharedComponents";
import * as React from "react";
import { useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  icon: any,
  disabled?: boolean,
  handlePress: any,
  accessibilityLabel: string,
  accessibilityHint?: string
}

const EvidenceButton = ( {
  icon,
  disabled,
  handlePress,
  accessibilityLabel,
  accessibilityHint
}: Props ): React.Node => {
  const theme = useTheme( );
  if ( !accessibilityLabel ) {
    throw new Error(
      "EvidenceButton needs an accessibility label"
    );
  }
  return (
    <INatIconButton
      onPress={handlePress}
      backgroundColor={disabled
        ? colors.lightGray
        : theme.colors.secondary}
      color={theme.colors.onSecondary}
      size={33}
      icon={icon}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      width={60}
      height={60}
      mode="contained"
    />
  );
};

export default EvidenceButton;
