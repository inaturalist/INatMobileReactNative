// @flow
import { useNavigation } from "@react-navigation/native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import {
  Button,
  Heading1,
  INatIconButton,
  Subheading1
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useTheme } from "react-native-paper";
import User from "realmModels/User";
import { useNumUnuploadedObservations, useTranslation } from "sharedHooks";

import Onboarding from "./Onboarding";

type Props = {
  toggleLayout: Function;
  layout: string,
  currentUser: ?Object,
  hideToolbar: boolean,
  setHeightAboveToolbar: Function,
  syncInProgress: boolean,
  uploadMultipleObservations: Function,
  syncObservations: Function,
  logInButtonNeutral: boolean
}

const Header = ( {
  toggleLayout,
  layout,
  currentUser,
  hideToolbar,
  setHeightAboveToolbar,
  syncInProgress,
  uploadMultipleObservations,
  syncObservations,
  logInButtonNeutral
}: Props ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const { t } = useTranslation( );

  const signedInContent = ( ) => (
    <Trans
      i18nKey="Welcome-user"
      parent={View}
      values={{ userHandle: User.userHandle( currentUser ) }}
      components={[
        <Subheading1 className="mt-5" />,
        <Heading1 />
      ]}
    />
  );

  const signedOutContent = ( ) => (
    <View className="my-5">
      <View className="flex-row items-center mb-5">
        <INatIconButton
          className="mr-5"
          icon="inaturalist"
          size={41}
          color={theme.colors.onSecondary}
          backgroundColor={theme.colors.secondary}
          accessibilityLabel="iNaturalist"
          mode="contained"
          width={67}
          height={67}
        />
        {numUnuploadedObs > 0
          ? (
            <View className="shrink">
              <Subheading1
                testID="log-in-to-iNaturalist-text"
              >
                {t( "Log-in-to-contribute-and-sync" )}
              </Subheading1>
              <Heading1>
                { t( "X-observations", { count: numUnuploadedObs } ) }
              </Heading1>
            </View>
          )
          : (
            <Subheading1
              className="my-5 shrink m-0"
              testID="log-in-to-iNaturalist-text-no-observations"
            >
              {t( "Log-in-to-contribute-your-observations" )}
            </Subheading1>
          )}
      </View>
      <Button
        onPress={( ) => navigation.navigate( "LoginStackNavigator" )}
        accessibilityRole="link"
        accessibilityLabel={t( "Log-in" )}
        text={t( "LOG-IN-TO-INATURALIST" )}
        level={logInButtonNeutral
          ? "neutral"
          : "focus"}
        testID="log-in-to-iNaturalist-button"
      />
    </View>
  );

  return (
    <>
      <View
        className="px-5 bg-white w-full"
        onLayout={event => {
          const {
            height
          } = event.nativeEvent.layout;
          setHeightAboveToolbar( height );
        }}
      >
        {currentUser
          ? signedInContent( )
          : signedOutContent( )}
        <Onboarding />
      </View>
      {!hideToolbar && (
        <ToolbarContainer
          toggleLayout={toggleLayout}
          layout={layout}
          numUnuploadedObs={numUnuploadedObs}
          syncInProgress={syncInProgress}
          uploadMultipleObservations={uploadMultipleObservations}
          syncObservations={syncObservations}
        />
      )}
    </>
  );
};

export default Header;
