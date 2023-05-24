// @flow

import {
  Body4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  region: Object,
  accuracy: number,
  getShadow: Function
};

const DisplayLatLng = ( { region, accuracy, getShadow }: Props ): Node => {
  const theme = useTheme( );
  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const displayLocation = ( ) => {
    let location = "";
    if ( region.latitude ) {
      location += `Lat: ${formatDecimal( region.latitude )}`;
    }
    if ( region.longitude ) {
      location += `, Lon: ${formatDecimal( region.longitude )}`;
    }
    if ( accuracy ) {
      location += `, Acc: ${accuracy.toFixed( 0 )}`;
    }
    return location;
  };

  return (
    <View
      className="bg-white h-[27px] rounded-lg absolute top-[85px] right-[26px] left-[26px]"
      style={getShadow( theme.colors.primary )}
    >
      <Body4 className="pt-[7px] pl-[14px]">
        {displayLocation( )}
      </Body4>
    </View>
  );
};

export default DisplayLatLng;
