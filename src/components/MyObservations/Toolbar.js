// @flow

import classNames from "classnames";
import { Body2, Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect } from "react";
import { IconButton, ProgressBar, useTheme } from "react-native-paper";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Props = {
  layout: string,
  statusText: ?string,
  handleSyncButtonPress: Function,
  uploadError: string,
  uploadInProgress: boolean,
  stopUpload: Function,
  progress: number,
  numUnuploadedObs: number,
  currentUser: ?Object,
  navToExplore: Function,
  toggleLayout: Function,
  getSyncIcon: Function
}

const Toolbar = ( {
  layout,
  statusText,
  handleSyncButtonPress,
  uploadError,
  uploadInProgress,
  stopUpload,
  progress,
  numUnuploadedObs,
  currentUser,
  navToExplore,
  toggleLayout,
  getSyncIcon
}: Props ): Node => {
  const theme = useTheme( );
  const uploadComplete = progress === 1;
  const uploading = uploadInProgress && !uploadComplete;
  const rotation = useSharedValue( 0 );

  const animatedStyles = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: `-${rotation.value}deg`
        }
      ]
    } ),
    [rotation.value]
  );

  const getRotationAnimation = toValue => withDelay(
    500,
    withTiming( toValue, {
      duration: 1000,
      easing: Easing.linear
    } )
  );

  useEffect( () => {
    const cleanup = () => {
      cancelAnimation( rotation );
      rotation.value = 0;
    };

    if ( uploading ) {
      rotation.value = withRepeat(
        withSequence(
          getRotationAnimation( 180 ),
          getRotationAnimation( 360 ),
          withTiming( 0, { duration: 0 } )
        ),
        -1
      );
    } else {
      cleanup();
    }

    return cleanup;
  }, [uploading, rotation] );

  const getSyncIconColor = ( ) => {
    if ( uploadError ) {
      return theme.colors.error;
    } if ( uploading || numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  };

  return (
    <View className={
      classNames(
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row justify-between items-center px-[7px]">
        <View className="flex-row items-center">
          {currentUser && (
            <IconButton
              icon="compass-rose-outline"
              onPress={navToExplore}
              accessibilityLabel={t( "Explore" )}
              accessibilityHint={t( "Navigates-to-explore" )}
              accessibilityRole="button"
              size={30}
              disabled={false}
              accessibilityState={{ disabled: false }}
            />
          )}
          <Animated.View
            style={animatedStyles}
          >
            <IconButton
              icon={getSyncIcon( )}
              size={30}
              onPress={handleSyncButtonPress}
              accessibilityRole="button"
              disabled={false}
              accessibilityState={{ disabled: false }}
              iconColor={getSyncIconColor( )}
            />
          </Animated.View>

          {statusText && (
            <View className="max-w-[200px] sm:max-w-[190px]">
              <View className="flex-row items-center">
                <Body2>{statusText}</Body2>
                {( uploadComplete && !uploadError ) && (
                  <View className="ml-2">
                    <INatIcon name="checkmark" size={11} color={theme.colors.secondary} />
                  </View>
                )}
              </View>
              {uploadError && (
                <Body4 className="mt-[3px] color-warningRed">
                  {uploadError}
                </Body4>
              )}
            </View>
          )}
          {( uploadInProgress && !uploadComplete ) && (
            <IconButton
              icon="close"
              size={11}
              iconColor={theme.colors.primary}
              onPress={stopUpload}
              accessibilityRole="button"
            />
          )}
        </View>
        <IconButton
          icon={layout === "grid" ? "listview" : "gridview"}
          size={30}
          disabled={false}
          accessibilityState={{ disabled: false }}
          testID={
            layout === "list"
              ? "MyObservationsToolbar.toggleGridView"
              : "MyObservationsToolbar.toggleListView"
          }
          onPress={toggleLayout}
          accessibilityRole="button"
        />
      </View>
      <ProgressBar
        progress={progress}
        color={theme.colors.secondary}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ backgroundColor: "transparent" }}
        visible={uploadInProgress && progress !== 0}
      />
    </View>
  );
};

export default Toolbar;
