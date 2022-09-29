// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { viewStyles } from "../../styles/sharedComponents/footer";
import { Pressable, View } from "../styledComponents";
import CameraOptionsButton from "./Buttons/CameraOptionsButton";

const Footer = ( ): React.Node => {
  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "MainStack", { screen: "ObsList" } );
  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: "ExploreLanding" } );
  const navToNotifications = ( ) => navigation.navigate( "MainStack", { screen: "Messages" } );

  return (
    <View
      className="flex-row h-24 absolute bottom-0 bg-white w-screen justify-evenly pt-2"
      style={viewStyles.shadow}
    >
      <Pressable onPress={toggleSideMenu} accessibilityRole="link">
        <Icon name="menu" size={30} />
      </Pressable>
      <Pressable onPress={navToExplore} accessibilityRole="link">
        <Icon name="web" size={30} />
      </Pressable>
      <CameraOptionsButton buttonType="footer" />
      <Pressable onPress={navToObsList} accessibilityRole="link">
        <Icon name="account" size={30} />
      </Pressable>
      <Pressable onPress={navToNotifications} accessibilityRole="link">
        <Icon name="bell" size={30} />
      </Pressable>
    </View>
  );
};

export default Footer;
