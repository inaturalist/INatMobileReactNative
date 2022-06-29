// @flow

import React, { useEffect, useState } from "react";
import {Image, Linking, ScrollView, TouchableOpacity, View} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import {Button, Paragraph, Dialog, Portal, Text, TextInput} from "react-native-paper";

import { textStyles, viewStyles, imageStyles } from "../../styles/login/login";
import { isLoggedIn, authenticateUser, getUsername, getUserId, signOut } from "./AuthenticationService";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { useTranslation } from "react-i18next";
import {colors} from "../../styles/global";

const Login = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loggedIn, setLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [username, setUsername] = useState( null );
  const [visible, setVisible] = useState( false );
  const [loading, setLoading] = useState( false );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => setVisible( false );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLoggedIn = async ( ) => {
      if ( !isCurrent ) {return;}

      setLoggedIn( await isLoggedIn( ) );
      if ( loggedIn ) {
        setUsername( await getUsername( ) );
      }
    };

    fetchLoggedIn( );

    return ( ) => {
      isCurrent = false;
    };
  }, [loggedIn] );

  const login = async ( ) => {
    setLoading( true );
    const success = await authenticateUser(
      email.trim( ),
      password
    );

    setLoading( false );

    if ( !success ) {
      setError( t( "Invalid-login" ) );
      return;
    }

    const userLogin = await getUsername( );
    const userId = await getUserId( );
    setUsername( userLogin );
    setLoggedIn( true );
    navigation.navigate( "my observations", {
      screen: "ObsList",
      params: { syncData: true, userLogin, userId }
    } );
  };

  const onSignOut = async ( ) => {
    await signOut( true );
    setLoggedIn( false );
  };

  const forgotPassword = () => {
    // TODO - should be put in a constant somewhere?
    Linking.openURL( "https://www.inaturalist.org/users/password/new" );
  };

  return (
    <ViewWithFooter>
      <ScrollView style={viewStyles.container}>
        {loggedIn
          ? (
            <>
              <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                  <Dialog.Content>
                    <Paragraph>{t( "Are-you-sure-you-want-to-sign-out" )}</Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button style={viewStyles.grayButton} onPress={hideDialog} testID="Login.signOutButton">
                      {t( "Cancel" )}
                    </Button>
                    <Button style={viewStyles.greenButton} onPress={onSignOut}>
                      {t( "Sign-out" )}
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
              <Text style={textStyles.text} testID="Login.loggedInAs">{t( "Logged-in-as", { username } )}</Text>
              <Button
                style={viewStyles.button}
                onPress={showDialog}
                mode="contained"
                uppercase={false}
                testID="Login.signOutButton">
                {t( "Sign-out" )}
              </Button>
            </>
          )
          : (
            <View>
              <Image style={imageStyles.logo} resizeMode="contain" source={require( "../../images/inat_logo.png" )} />
              <Text style={textStyles.header}>{t( "Login-header" )}</Text>
              <Text style={textStyles.subtitle}>{t( "Login-sub-title" )}</Text>
              <Text style={textStyles.fieldText}>{t( "Username-or-Email" )}</Text>
              <TextInput
                style={viewStyles.input}
                onChangeText={text => {
                  setError( null );
                  setEmail( text );
                }}
                value={email}
                autoComplete="email"
                testID="Login.email"
                autoCapitalize="none"
                keyboardType="email-address"
                selectionColor={colors.black}
              />
              <Text style={textStyles.fieldText}>{t( "Password" )}</Text>
              <TextInput
                style={viewStyles.input}
                onChangeText={text => {
                  setError( null );
                  setPassword( text );
                }}
                value={password}
                secureTextEntry={true}
                testID="Login.password"
                selectionColor={colors.black}
              />
              <TouchableOpacity onPress={forgotPassword}>
                <Text style={textStyles.forgotPassword}>{t( "Forgot-Password" )}</Text>
              </TouchableOpacity>
              {error && <Text style={textStyles.error}>{error}</Text>}
              <Button
                style={viewStyles.button}
                mode="contained"
                uppercase={false}
                onPress={login}
                loading={loading}
                disabled={!email || !password}
                testID="Login.loginButton">
                {t( "Log-in" )}
              </Button>
            </View>
          )}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default Login;
