import { AppleButton } from "@invertase/react-native-apple-authentication";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2, Button, INatIcon, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts.ts";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import colors from "styles/tailwindColors";

import { authenticateUser } from "./AuthenticationService";
import Error from "./Error";
import { signInWithApple, signInWithGoogle } from "./loginFormHelpers";
import LoginSignUpInputField from "./LoginSignUpInputField";

const { useRealm } = RealmContext;

interface Props {
  hideFooter?: boolean;
}

interface LoginFormParams {
  emailConfirmed?: boolean;
  prevScreen?: string;
  projectId?: number;
}

type ParamList = {
  LoginFormParams: LoginFormParams
}

const APPLE_BUTTON_STYLE = {
  maxWidth: 500,
  height: 45, // You must specify a height
  marginTop: 10
};

const LoginForm = ( {
  hideFooter
}: Props ) => {
  const { params } = useRoute<RouteProp<ParamList, "LoginFormParams">>( );
  const emailConfirmed = params?.emailConfirmed;
  const realm = useRealm( );
  const emailRef = useRef<TextInput>( null );
  const passwordRef = useRef<TextInput>( null );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState<string | null>( null );
  const [loading, setLoading] = useState( false );
  const [isPasswordVisible, setIsPasswordVisible] = useState( false );
  const { keyboardShown } = useKeyboardInfo( );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
    if ( passwordRef.current ) {
      passwordRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscrubeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscrubeTransition;
  }, [navigation] );

  const logIn = React.useCallback( async ( logInCallback: () => Promise<boolean> ) => {
    setLoading( true );
    const success = await logInCallback( );

    if ( !success ) {
      setError( t( "Failed-to-log-in" ) );
      setLoading( false );
      return;
    }
    setLoading( false );

    if ( params?.prevScreen && params?.projectId ) {
      navigation.navigate( "TabNavigator", {
        screen: "TabStackNavigator",
        params: {
          screen: "ProjectDetails",
          params: {
            id: params?.projectId
          }
        }
      } );
    } else {
      navigation.getParent( )?.goBack( );
    }
  }, [
    navigation,
    params
  ] );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 mt-[9px] justify-end">
        { emailConfirmed && (
          <View className="flex-row mb-5 items-center justify-center mx-2">
            <View className="bg-white rounded-full">
              <INatIcon
                name="checkmark-circle"
                color={String( colors?.inatGreen )}
                size={19}
              />
            </View>
            <List2 className="ml-3 text-white font-medium">
              {t( "Your-email-is-confirmed" )}
            </List2>
          </View>
        ) }
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          autoComplete="email"
          headerText={t( "USERNAME-OR-EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={( text: string ) => setEmail( text )}
          testID="Login.email"
          // https://github.com/facebook/react-native/issues/39411#issuecomment-1817575790
          // textContentType prevents visual flickering, which is a temporary issue
          // in iOS 17
          textContentType="emailAddress"
        />
        <LoginSignUpInputField
          ref={passwordRef}
          accessibilityLabel={t( "PASSWORD" )}
          autoComplete="current-password"
          headerText={t( "PASSWORD" )}
          inputMode="text"
          onChangeText={( text: string ) => setPassword( text )}
          secureTextEntry={!isPasswordVisible}
          testID="Login.password"
          textContentType="password"
        />
        <View className="flex-row justify-between">
          <Body2
            accessibilityRole="button"
            className="underline p-4 color-white"
            onPress={() => setIsPasswordVisible( prevState => !prevState )}
          >
            {isPasswordVisible
              ? t( "Hide" )
              : t( "Reveal" )}
          </Body2>
          <Body2
            accessibilityRole="button"
            className="underline p-4 color-white"
            onPress={( ) => navigation.navigate( "ForgotPassword" )}
          >
            {t( "Forgot-Password" )}
          </Body2>
        </View>
        {error && <Error error={error} />}
        <Button
          className={classnames( "mt-[30px]", {
            "mt-5": error
          } )}
          disabled={!email || !password}
          forceDark
          level="focus"
          loading={loading}
          onPress={() => logIn( async () => authenticateUser(
            email.trim( ),
            password,
            realm
          ) )}
          testID="Login.loginButton"
          text={t( "LOG-IN" )}
        />
        {/*
          Note: Sign in with Apple is doable in Android if we want to:
          https://github.com/invertase/react-native-apple-authentication?tab=readme-ov-file#android
        */}
        { Platform.OS === "ios" && (
          <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={APPLE_BUTTON_STYLE}
            onPress={() => logIn( async ( ) => signInWithApple( realm ) )}
          />
        ) }
        <Button
          text={t( "Sign-in-with-Google" )}
          onPress={() => logIn( async ( ) => signInWithGoogle( realm ) )}
          disabled={loading}
          className="mt-3"
        />
        {!hideFooter && (
          <Body1
            className={classnames(
              "color-white self-center mt-[31px] underline",
              // When the keyboard is up this pushes the form up enough to cut
              // off the username label on some devices
              !keyboardShown && "mb-[35px]"
            )}
            onPress={( ) => navigation.navigate( "SignUp" )}
          >
            {t( "Dont-have-an-account" )}
          </Body1>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginForm;
