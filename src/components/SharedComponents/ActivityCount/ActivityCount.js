// @flow

import classNames from "classnames";
import INatIcon from "components/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  white: Boolean,
  count: number,
  icon?: string,
  testID?: string,
  margin?: string
}

const ActivityCount = ( {
  accessibilityHint,
  accessibilityLabel,
  white,
  count,
  icon,
  testID,
  margin
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  return (
    <View
      className={classNames( "flex-row items-center", margin )}
      accessible
      accessibilityLabel={
        accessibilityLabel || t( "Intl-number", { val: count || 0 } )
      }
      accessibilityHint={accessibilityHint}
    >
      <INatIcon
        name={icon || "comments-filled-in"}
        color={white ? theme.colors.onPrimary : theme.colors.primary}
        size={14}
      />
      <Body3
        className={classNames( "ml-1.5", white && "text-white" )}
        testID={testID}
      >
        {t( "Intl-number", { val: count || 0 } )}
      </Body3>
    </View>
  );
};

export default ActivityCount;
