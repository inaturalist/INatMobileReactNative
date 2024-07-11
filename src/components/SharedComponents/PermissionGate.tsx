import classnames from "classnames";
import {
  Body2,
  Button,
  Heading2,
  INatIcon,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import {
  ImageBackground,
  View
} from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import {
  Linking,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { PermissionStatus, RESULTS } from "react-native-permissions";
import colors from "styles/tailwindColors";

const BACKGROUND_IMAGE_STYLE = {
  opacity: 0.33,
  backgroundColor: "black"
} as const;

const isTablet = DeviceInfo.isTablet();

interface Props {
  requestPermission: () => void;
  grantStatus: PermissionStatus;
  icon: string;
  title?: string;
  titleDenied?: string;
  body?: string;
  blockedPrompt?: string;
  buttonText?: string;
  image?: number;
  onClose: () => void;
  testID?: string;
}

const PermissionGate = ( {
  requestPermission,
  grantStatus,
  icon,
  title = t( "Grant-Permission-title" ),
  titleDenied = t( "Please-Grant-Permission" ),
  body,
  blockedPrompt = t( "Youve-denied-permission-prompt" ),
  buttonText = t( "GRANT-PERMISSION" ),
  image = require( "images/bart-zimny-W5XTTLpk1-I-unsplash.jpg" ),
  onClose,
  testID
}: Props ) => (
  <ViewWrapper wrapperClassName="bg-black" testID={testID}>
    <StatusBar barStyle="light-content" backgroundColor="black" />
    <ImageBackground
      source={image}
      imageStyle={BACKGROUND_IMAGE_STYLE}
      accessibilityIgnoresInvertColors
      className={classnames(
        "w-full",
        "h-full",
        "items-center"
      )}
    >
      <INatIconButton
        testID="close-permission-gate"
        icon="close"
        color={colors.white}
        onPress={() => onClose( )}
        className="absolute top-2 right-2 z-10"
        accessibilityLabel={t( "Close-permission-request-screen" )}
      />
      <View
        className={classnames(
          isTablet
            ? "w-[500px]"
            : "w-full",
          "h-full",
          isTablet
            ? "justify-center"
            : "justify-end",
          "p-5",
          "items-center"
        )}
      >
        { icon && (
          <INatIcon
            name={icon}
            color={colors.white}
            size={40}
          />
        ) }
        <Heading2 className="text-center text-white mt-8 mb-5">
          { grantStatus === RESULTS.BLOCKED
            ? titleDenied
            : title}
        </Heading2>
        { body && (
          <Body2 className="text-center text-white">{ body }</Body2>
        ) }
        { grantStatus === RESULTS.BLOCKED && (
          <Body2 className="text-center text-white mt-5">
            { blockedPrompt }
          </Body2>
        ) }
        { grantStatus === RESULTS.BLOCKED
          ? (
            <Button
              level="focus"
              onPress={( ) => Linking.openSettings( )}
              text={t( "OPEN-SETTINGS" )}
              className="w-full mt-10"
            />
          )
          : (
            <Button
              level="focus"
              onPress={requestPermission}
              text={buttonText}
              className="w-full mt-10"
            />
          )}
      </View>
    </ImageBackground>
  </ViewWrapper>
);

export default PermissionGate;
