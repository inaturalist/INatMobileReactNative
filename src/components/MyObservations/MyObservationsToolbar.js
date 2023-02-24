// @flow

import { useNavigation } from "@react-navigation/native";
import { Body2, Body4 } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import {
  Animated, Dimensions, Easing, PixelRatio
} from "react-native";
import { IconButton, ProgressBar } from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";
import colors from "styles/tailwindColors";

type Props = {
  setLayout: Function,
  layout: string,
  numUnuploadedObs: number
};

const MyObservationsToolbar = ( { setLayout, layout, numUnuploadedObs }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const { allObsToUpload } = useLocalObservations( );
  const navigation = useNavigation( );
  const {
    stopUpload,
    uploadInProgress,
    startUpload,
    // progress,
    error: uploadError,
    currentUploadIndex,
    totalUploadCount
  } = useUploadObservations( allObsToUpload );

  const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get();
  const spinValue = new Animated.Value( 1 );

  Animated.timing( spinValue, {
    toValue: 0,
    duration: 3000,
    easing: Easing.linear,
    useNativeDriver: true
  } ).start( );

  const spin = spinValue.interpolate( {
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  } );

  const loading = obsEditContext?.loading;
  const syncObservations = obsEditContext?.syncObservations;

  const getSyncClick = ( ) => {
    if ( numUnuploadedObs > 0 ) {
      return startUpload;
    }

    return syncObservations;
  };

  const getStatusText = ( ) => {
    if ( numUnuploadedObs <= 0 ) {
      return null;
    }

    if ( !uploadInProgress ) {
      return t( "Upload-x-observations", { count: numUnuploadedObs } );
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
  };

  const getSyncIconColor = ( ) => {
    if ( uploadInProgress || numUnuploadedObs > 0 ) {
      return colors.inatGreen;
    }
    return colors.darkGray;
  };

  const progress = 0.5;

  const statusText = getStatusText( );
  /* eslint-disable react-native/no-inline-styles */
  return (
    <View className="bg-white justify-center border-b border-lightGray h-[78px]">
      <View className="flex-row items-center px-[15px]">
        {currentUser && (
          <IconButton
            icon="compass-rose"
            onPress={( ) => navigation.navigate( "MainStack", { screen: "Explore" } )}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            disabled={false}
            size={26}
          />
        )}
        <Pressable
          onPress={getSyncClick( )}
          accessibilityRole="button"
          disabled={loading || uploadInProgress}
          accessibilityState={{ disabled: loading || uploadInProgress }}
        >
          <Animated.View
            style={uploadInProgress ? { transform: [{ rotate: spin }] } : {}}
          >
            <IconMaterial name="sync" size={26} color={getSyncIconColor( )} />
          </Animated.View>
        </Pressable>

        {statusText && (
          <View>
            <Body2 className="ml-1">{statusText}</Body2>
            {uploadError && (
            <Body4
              className="ml-1 mt-[3px]"
              style={{ color: colors.warningRed }}
            >
              {uploadError}
            </Body4>
            )}
          </View>
        )}

        <View className="ml-auto flex flex-row items-center">
          {uploadInProgress && (
            <Pressable onPress={stopUpload} accessibilityRole="button">
              <IconMaterial name="close" size={11} color={colors.darkGray} />
            </Pressable>
          )}

          <Pressable
            className="ml-2"
            testID={
              layout === "list"
                ? "ObsList.toggleGridView"
                : "ObsList.toggleListView"
            }
            onPress={( ) => setLayout( currentView => {
              if ( currentView === "list" ) {
                return "grid";
              }
              return "list";
            } )}
            accessibilityRole="button"
          >
            <IconMaterial
              name={layout === "grid" ? "format-list-bulleted" : "grid-view"}
              size={30}
            />
          </Pressable>
        </View>
      </View>
      <ProgressBar
        progress={progress}
        color={colors.inatGreen}
        style={{ backgroundColor: "transparent" }}
        visible={uploadInProgress && progress !== 0}
      />
    </View>
  );
};

export default MyObservationsToolbar;
