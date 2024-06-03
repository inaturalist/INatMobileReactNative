// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { TouchableWithoutFeedback } from "react-native";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  reset: Function
}

const ForgotPasswordForm = ( { reset }: Props ): Node => {
  const [email, setEmail] = useState( "" );
  const emailRef = useRef( null );
  const navigation = useNavigation( );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscribeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscribeTransition;
  }, [navigation] );

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 my-5 justify-end">
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          autoComplete="email"
          headerText={t( "USERNAME-OR-EMAIL" )}
          keyboardType="email-address"
          onChangeText={text => setEmail( text )}
          testID="Login.email"
        />
        <Button
          level="focus"
          text={t( "RESET-PASSWORD" )}
          onPress={( ) => reset( email )}
          className="my-[30px]"
          disabled={!email}
          testID="Login.forgotPasswordButton"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ForgotPasswordForm;
