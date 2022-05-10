// @flow

import React, { useEffect, useState } from "react";
import type { Node } from "react";
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  Text,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { viewStyles } from "../../styles/permissionGate";
import ViewNoFooter from "./ViewNoFooter";

type Props = {
  children: Node,
  permission: string
}

// Prompts the user for an Android permission and renders children if granted.
// Otherwise renders a view saying that permission is required, with a button
// to grant it if the user hasn't asked not to be bothered again. In the
// future we might want to extend this to always show a custom view before
// asking the user for a permission.
const PermissionGate = ( { children, permission }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation();
  const [result, setResult] = useState( Platform.OS === "android" ? null : "granted" );
  useEffect( ( ) => {
    // kueda 20220422: for reasons I don't understand, the app crashes if this
    // effect refers to anything defined outside of this function, hence no
    // constances for the result states and no abstraction of this method for
    // requesting permissions
    const requestAndroidPermissions = async ( ) => {
      try {
        const r = await PermissionsAndroid.request( permission );
        if ( r === PermissionsAndroid.RESULTS.GRANTED ) {
          setResult( "granted" );
        } else if ( r === PermissionsAndroid.RESULTS.DENIED ) {
          setResult( "denied" );
        } else {
          setResult( "never_ask_again" );
        }
      } catch ( e ) {
        console.warn( `[DEBUG ${Platform.OS}] PermissionGate: Failed to request permission (${permission}): ${e}` );
      }
    };
    // If this is Android and we haven't even checked the permissions, do it now
    if ( result === null ) {
      requestAndroidPermissions( );
    }

    // If this component has already been rendered but was just returned to in the navigation, check again
    navigation.addListener( "focus", async ( ) => {
      if ( result === null && Platform.OS === "android" ) {
        await requestAndroidPermissions( );
      }
    } );
  }, [permission, navigation, result] );

  const manualGrantButton = (
    <Pressable
      style={viewStyles.permissionButton}
      onPress={ async ( ) => {
        try {
          const r = await PermissionsAndroid.request( permission );
          if ( r === PermissionsAndroid.RESULTS.GRANTED ) {
            setResult( "granted" );
          } else if ( r === PermissionsAndroid.RESULTS.DENIED ) {
            setResult( "denied" );
          } else {
            setResult( "never_ask_again" );
          }
        } catch ( e ) {
          console.warn( `[DEBUG ${Platform.OS}] PermissionGate: Failed to request permission (${permission}): ${e}` );
        }
      }}
    >
      <Text>{ t( "Grant-Permission" ) }</Text>
    </Pressable>
  );

  const noPermission = (
    <ViewNoFooter>
      <Text>{ t( "You-denied-iNaturalist-permission-to-do-that" ) }</Text>
      { result === "denied" && manualGrantButton }
      { result === "never_ask_again" && (
        <Text>{ t( "Go-to-the-Settings-app-to-grant-permissions" ) }</Text>
      ) }
    </ViewNoFooter>
  );

  let content = <Text>Requesting permission...</Text>;
  if ( result === "granted" ) { content = children; }
  else if ( result !== null ) { content = noPermission; }

  return (
    <View style={{ flex: 1 }}>
      { content }
    </View>
  );
};

export default PermissionGate;
