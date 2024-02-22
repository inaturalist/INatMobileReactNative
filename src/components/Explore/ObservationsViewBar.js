// @flow

import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  layout: string,
  updateObservationsView: Function
};

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

const ObservationsViewBar = ( {
  layout,
  updateObservationsView
}: Props ): Node => {
  const theme = useTheme( );

  const buttons = [
    {
      value: "list",
      icon: "hamburger-menu",
      accessibilityLabel: "List",
      testID: "SegmentedButton.list"
    },
    {
      value: "grid",
      icon: "grid",
      accessibilityLabel: "Grid",
      testID: "SegmentedButton.grid"
    },
    {
      value: "map",
      icon: "map",
      accessibilityLabel: "Map",
      testID: "SegmentedButton.map"
    }
  ];

  return (
    <View
      className="absolute bottom-5 left-5 z-10 h-11 flex-row"
    >
      {buttons.map( ( {
        value, icon, accessibilityLabel, testID
      }, i ) => {
        const checked = value === layout;
        const isFirst = i === 0;
        const isLast = i === buttons.length - 1;
        const outerBorderStyle = {
          borderTopLeftRadius: isFirst
            ? 20
            : 0,
          borderBottomLeftRadius: isFirst
            ? 20
            : 0,
          borderTopRightRadius: isLast
            ? 20
            : 0,
          borderBottomRightRadius: isLast
            ? 20
            : 0
        };
        const spacerStyle = {
          borderRightWidth: isLast
            ? 0
            : 1,
          borderRightColor: colors.lightGray
        };
        const backgroundColor = {
          backgroundColor: checked
            ? colors.inatGreen
            : colors.white
        };

        return (
          <INatIconButton
            key={value}
            accessibilityLabel={accessibilityLabel}
            color={value === layout
              ? colors.white
              : colors.darkGray}
            icon={icon}
            onPress={() => updateObservationsView( value )}
            size={20}
            width={isFirst || isLast
              ? 48
              : 44}
            style={[
              getShadow( theme.colors.primary ),
              outerBorderStyle,
              spacerStyle,
              backgroundColor
            ]}
            testID={testID}
            backgroundColor={value === layout
              ? colors.inatGreen
              : colors.white}
          />
        );
      } )}
    </View>
  );
};

export default ObservationsViewBar;
