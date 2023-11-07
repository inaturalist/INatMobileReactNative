// @flow

import classNames from "classnames";
import {
  Body2,
  Body4,
  INatIcon,
  INatIconButton,
  RotatingINatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { ProgressBar, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

type Props = {
  layout: string,
  handleSyncButtonPress: Function,
  uploadError: ?string,
  uploadInProgress: boolean,
  stopUpload: Function,
  progress: number,
  numUnuploadedObs: number,
  showsExploreIcon: boolean,
  navToExplore: Function,
  toggleLayout: Function,
  currentUploadIndex: number,
  totalUploadCount: number
}

const Toolbar = ( {
  layout,
  handleSyncButtonPress,
  uploadError,
  uploadInProgress,
  stopUpload,
  progress,
  numUnuploadedObs,
  showsExploreIcon,
  navToExplore,
  toggleLayout,
  currentUploadIndex,
  totalUploadCount
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const uploadComplete = progress === 1;
  const uploading = uploadInProgress && !uploadComplete;

  const needsSync = useCallback( ( ) => (
    ( numUnuploadedObs > 0 && !uploadInProgress ) || ( uploadError && !uploadInProgress )
  ), [
    numUnuploadedObs,
    uploadInProgress,
    uploadError
  ] );

  const getStatusText = useCallback( ( ) => {
    if ( progress === 1 ) {
      return t( "X-observations-uploaded", { count: totalUploadCount } );
    }

    if ( !uploadInProgress ) {
      return numUnuploadedObs !== 0
        ? t( "Upload-x-observations", { count: numUnuploadedObs } )
        : "";
    }

    const translationParams = {
      total: totalUploadCount,
      uploadedCount: currentUploadIndex + 1
    };

    // iPhone 4 pixel width
    if ( screenWidth <= 640 ) {
      return t( "Uploading-x-of-y", translationParams );
    }

    return t( "Uploading-x-of-y-observations", translationParams );
  }, [
    currentUploadIndex,
    totalUploadCount,
    progress,
    numUnuploadedObs,
    uploadInProgress,
    t
  ] );

  const getSyncIconColor = useCallback( ( ) => {
    if ( uploadError ) {
      return theme.colors.error;
    } if ( uploading || numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  }, [theme, uploading, uploadError, numUnuploadedObs] );

  const statusText = getStatusText( );

  return (
    <View className={
      classNames(
        { "border-b border-lightGray": layout !== "grid" }
      )
    }
    >
      <View className="flex-row items-center mx-4">
        {showsExploreIcon && (
          <INatIconButton
            icon="compass-rose-outline"
            onPress={navToExplore}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            size={30}
            disabled={false}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="m-0 ml-[-8px]"
          />
        )}
        <View
          // Note that without shrink, the center element will grow and push
          // the grid/list button off the screen
          className="flex-row items-center shrink"
        >
          <RotatingINatIconButton
            icon={
              needsSync( )
                ? "sync-unsynced"
                : "sync"
            }
            rotating={uploading}
            onPress={handleSyncButtonPress}
            color={getSyncIconColor( )}
            disabled={false}
            accessibilityLabel={t( "Sync-observations" )}
            size={30}
            testID="SyncButton"
          />

          {statusText && (
            <View className="flex ml-1 shrink">
              <View className="flex-row items-center shrink">
                <Body2
                  onPress={
                    needsSync( )
                      ? handleSyncButtonPress
                      : ( ) => { }
                  }
                >
                  {statusText}
                </Body2>
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
          {uploading && (
            <INatIconButton
              icon="close"
              size={11}
              accessibilityLabel={t( "Stop-upload" )}
              onPress={stopUpload}
            />
          )}
        </View>
        <INatIconButton
          icon={layout === "grid"
            ? "listview"
            : "gridview"}
          size={30}
          disabled={false}
          accessibilityLabel={layout === "grid"
            ? t( "List-view" )
            : t( "Grid-view" )}
          testID={
            layout === "list"
              ? "MyObservationsToolbar.toggleGridView"
              : "MyObservationsToolbar.toggleListView"
          }
          onPress={toggleLayout}
          // Negative margin here is similar to above: trying to get the icon
          // flush with the container. ml-auto is a bit of a hack to pull
          // this button all the way to the end.
          className="m-0 mr-[-8px] ml-auto"
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
