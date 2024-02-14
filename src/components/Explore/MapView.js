// @flow

import { Button, Map } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

type Props = {
  observations: Array<Object>,
  onPanDrag: Function,
  redoSearchInMapArea: Function,
  region: Object,
  tileMapParams: Object,
  showMapBoundaryButton: boolean,
  updateMapBoundaries: Function
}

const MapView = ( {
  observations,
  onPanDrag,
  redoSearchInMapArea,
  region,
  tileMapParams,
  showMapBoundaryButton,
  updateMapBoundaries
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  return (
    <>
      <View className="z-10">
        {showMapBoundaryButton && (
          <View
            className="mx-auto"
            style={getShadow( theme.colors.primary )}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-6 absolute self-center"
              onPress={redoSearchInMapArea}
            />
          </View>
        )}
      </View>
      <Map
        currentLocationButtonClassName="left-5 bottom-20"
        getMapBoundaries={updateMapBoundaries}
        mapViewClassName="-mt-4"
        observations={observations}
        onPanDrag={onPanDrag}
        region={region}
        showCurrentLocationButton
        showExplore
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-20"
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
      />
    </>
  );
};

export default MapView;
