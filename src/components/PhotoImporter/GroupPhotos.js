// @flow

import { FlashList } from "@shopify/flash-list";
import {
  Body2, Button, FloatingActionBar, INatIcon, INatIconButton, StickyToolbar
} from "components/SharedComponents";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useDeviceOrientation } from "sharedHooks";

import GroupPhotoImage from "./GroupPhotoImage";

type Props = {
  groupedPhotos: Array<Object>,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  navToObsEdit: Function,
  combinePhotos: Function,
  removePhotos: Function,
  separatePhotos: Function,
  totalPhotos: number
}

const GUTTER = 15;

const GroupPhotos = ( {
  groupedPhotos,
  selectedObservations,
  selectObservationPhotos,
  navToObsEdit,
  combinePhotos,
  removePhotos,
  separatePhotos,
  totalPhotos
}: Props ): Node => {
  const theme = useTheme();
  const {
    isLandscapeMode, isTablet, screenWidth, screenHeight
  } = useDeviceOrientation();
  const extractKey = ( item, index ) => ( item.empty
    ? "empty"
    : `${item.photos[0].uri}${index}` );

  const noObsSelected = selectedObservations.length === 0;
  const oneObsSelected = selectedObservations.length === 1;
  const obsWithMultiplePhotosSelected
    = selectedObservations?.[0]?.photos?.length > 1;

  const calculateNumColumns = () => {
    if ( screenWidth <= BREAKPOINTS.sm ) {
      return 1;
    }
    if ( !isTablet ) return 2;
    if ( isLandscapeMode ) return 6;
    if ( screenWidth <= BREAKPOINTS.xl ) return 2;
    return 4;
  };
  const numColumns = calculateNumColumns();
  const calculateGridItemWidth = () => {
    const combinedGutter = ( numColumns + 1 ) * GUTTER;
    const gridWidth = isTablet
      ? screenWidth
      : Math.min( screenWidth, screenHeight );
    return Math.floor( ( gridWidth - combinedGutter ) / numColumns );
  };
  const itemWidth = calculateGridItemWidth();

  const itemStyle = {
    height: itemWidth,
    width: itemWidth,
    margin: GUTTER / 2
  };

  const renderImage = item => (
    <GroupPhotoImage
      item={item}
      selectedObservations={selectedObservations}
      selectObservationPhotos={selectObservationPhotos}
      style={itemStyle}
    />
  );

  const renderItem = ( { item } ) => {
    if ( item.empty ) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => console.log( "TODO" )}
          className="rounded-[15px] justify-center items-center"
          // Sorry, couldn't get this to work with tailwind
          // eslint-disable-next-line react-native/no-inline-styles
          style={[itemStyle, {
            borderWidth: 4,
            borderStyle: "dashed",
            borderColor: theme.colors.mediumGray
          }]}
        >
          <INatIcon name="plus" size={50} color={theme.colors.mediumGray} />
        </Pressable>
      );
    }
    return renderImage( item );
  };

  const data = [].concat( groupedPhotos );
  if ( totalPhotos < 20 ) {
    data.push( { empty: true } );
  }

  return (
    <ViewWrapper>
      <FlashList
        contentContainerStyle={{
          paddingLeft: GUTTER / 2,
          paddingRight: GUTTER / 2,
          paddingBottom: 80 + GUTTER / 2
        }}
        ListHeaderComponent={(
          <View className="m-5">
            <Body2>{t( "Group-photos-onboarding" )}</Body2>
          </View>
        )}
        data={data}
        initialNumToRender={4}
        keyExtractor={extractKey}
        numColumns={numColumns}
        key={numColumns}
        renderItem={renderItem}
        testID="GroupPhotos.list"
        extraData={{
          selectedObservations,
          itemWidth
        }}
        estimatedItemSize={itemWidth + GUTTER}
      />
      <FloatingActionBar
        show={selectedObservations.length > 0}
        position="bottomStart"
        containerClass="bottom-[90px] ml-[15px] rounded-md"
      >
        <View className="rounded-md overflow-hidden flex-row">
          <INatIconButton
            icon="combine"
            mode="contained"
            size={20}
            color={theme.colors.onPrimary}
            backgroundColor={theme.colors.primary}
            className="m-4"
            accessibilityLabel={t( "Combine-Photos" )}
            disabled={noObsSelected || oneObsSelected}
            onPress={combinePhotos}
          />
          <INatIconButton
            icon="separate"
            mode="contained"
            size={20}
            color={theme.colors.onPrimary}
            backgroundColor={theme.colors.primary}
            className="m-4"
            accessibilityLabel={t( "Separate-Photos" )}
            disabled={!obsWithMultiplePhotosSelected}
            onPress={separatePhotos}
          />
          <INatIconButton
            icon="trash-outline"
            mode="contained"
            size={20}
            color={theme.colors.onError}
            backgroundColor={theme.colors.error}
            className="m-4"
            accessibilityLabel={t( "Remove-Photos" )}
            disabled={noObsSelected}
            onPress={removePhotos}
          />
        </View>
      </FloatingActionBar>
      <StickyToolbar containerClass="items-center">
        <Button
          className="max-w-[500px] w-full"
          level="focus"
          text={t( "IMPORT-X-OBSERVATIONS", { count: groupedPhotos.length } )}
          onPress={navToObsEdit}
          testID="GroupPhotos.next"
        />
      </StickyToolbar>
    </ViewWrapper>
  );
};

export default GroupPhotos;
