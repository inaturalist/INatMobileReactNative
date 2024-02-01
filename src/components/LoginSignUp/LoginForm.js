// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2, Button, INatIcon, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";

import {
  authenticateUser
} from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

type Props = {
  hideFooter: boolean,
  setLoggedIn: Function
}

const LoginForm = ( {
  hideFooter,
  setLoggedIn
}: Props ): Node => {
  const { params } = useRoute( );
  const emailConfirmed = params?.emailConfirmed;
  const realm = useRealm( );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState( null );
  const [loading, setLoading] = useState( false );
  const theme = useTheme();

  const login = async ( ) => {
    setLoading( true );
    const success = await authenticateUser(
      email.trim( ),
      password,
      realm
    );

    if ( !success ) {
      setError( t( "Failed-to-log-in" ) );
      setLoading( false );
      return;
    }
    setLoggedIn( true );
    setLoading( false );

    navigation.getParent( )?.goBack( );
  };

  const showEmailConfirmed = ( ) => (
    <View className="flex-row mb-5 items-center justify-center mx-2">
      <View className="bg-white rounded-full">
        <INatIcon
          name="checkmark-circle"
          color={theme.colors.secondary}
          size={19}
        />
      </View>
      <List2 className="ml-3 text-white font-medium">
        {t( "Your-email-is-confirmed" )}
      </List2>
    </View>
  );

  return (
    <View className="px-4 mt-[9px] justify-end">
      {emailConfirmed && showEmailConfirmed( )}
      <LoginSignUpInputField
        accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
        autoComplete="email"
        headerText={t( "USERNAME-OR-EMAIL" )}
        keyboardType="email-address"
        onChangeText={text => setEmail( text )}
        testID="Login.email"
        // https://github.com/facebook/react-native/issues/39411#issuecomment-1817575790
        // textContentType prevents visual flickering, which is a temporary issue
        // in iOS 17
        textContentType="oneTimeCode"
      />
      <LoginSignUpInputField
        accessibilityLabel={t( "PASSWORD" )}
        headerText={t( "PASSWORD" )}
        onChangeText={text => setPassword( text )}
        secureTextEntry
        testID="Login.password"
        textContentType="oneTimeCode"
      />
      <View className="mx-4">
        <Body2
          accessibilityRole="button"
          className="underline mt-[15px] self-end color-white"
          onPress={( ) => navigation.navigate( "ForgotPassword" )}
        >
          {t( "Forgot-Password" )}
        </Body2>
        {error && <Error error={error} />}
      </View>
      <Button
        className={classnames( "mt-[30px]", {
          "mt-5": error
        } )}
        disabled={!email || !password}
        forceDark
        level="focus"
        loading={loading}
        onPress={login}
        testID="Login.loginButton"
        text={t( "LOG-IN" )}
      />
      {!hideFooter && (
        <Body1
          className="color-white self-center mt-[30px] underline"
          onPress={( ) => navigation.navigate( "SignUp" )}
        >
          {t( "Dont-have-an-account" )}
        </Body1>
      )}
    </View>
  );
};

export default LoginForm;
