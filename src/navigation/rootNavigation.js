// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from "react-native-paper";

import About from "../components/About";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { getUserId, signOut } from "../components/LoginSignUp/AuthenticationService";
import Login from "../components/LoginSignUp/Login";
import NetworkLogging from "../components/NetworkLogging";
import PlaceholderComponent from "../components/PlaceholderComponent";
import Search from "../components/Search/Search";
import Settings from "../components/Settings/Settings";
import Mortal from "../components/SharedComponents/Mortal";
import ObsEditProvider from "../providers/ObsEditProvider";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";
import colors from "../styles/colors";
import { viewStyles } from "../styles/navigation/rootNavigation";
import CameraStackNavigation from "./cameraStackNavigation";
import ExploreStackNavigator from "./exploreStackNavigation";
import IdentifyStackNavigation from "./identifyStackNavigation";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";
import NotificationsStackNavigation from "./notificationsStackNavigation";
import ProjectsStackNavigation from "./projectsStackNavigation";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <View /> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => <Mortal><Login /></Mortal>;

const Drawer = createDrawerNavigator( );

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.inatGreen,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    surface: colors.white
  }
};

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent state={state} navigation={navigation} descriptors={descriptors} />
);

const App = ( ): React.Node => {
  React.useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      const userId = await getUserId( );
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = await AsyncStorage.getItem( "alreadyLaunched" );
      let deleteRealm = false;
      if ( !alreadyLaunched ) {
        deleteRealm = true;
        await AsyncStorage.setItem( "alreadyLaunched", "true" );
      }
      if ( !userId ) {
        await signOut( { deleteRealm } );
      }
    };

    checkForSignedInUser( );
  }, [] );

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={viewStyles.container}>
        <NavigationContainer>
          <PhotoGalleryProvider>
            <ObsEditProvider>
              <Drawer.Navigator
                screenOptions={screenOptions}
                name="Drawer"
                drawerContent={drawerRenderer}
              >
                <Drawer.Screen
                  name="my observations"
                  component={MyObservationsStackNavigator}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="notifications"
                  component={NotificationsStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="identify"
                  component={IdentifyStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen name="search" component={Search} />
                <Drawer.Screen
                  name="projects"
                  component={ProjectsStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen name="settings" component={Settings} options={hideHeader} />
                <Drawer.Screen name="following (dashboard)" component={PlaceholderComponent} />
                <Drawer.Screen
                  name="about"
                  component={About}
                />
                <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
                <Drawer.Screen name="login" component={MortalLogin} options={hideHeader} />
                <Drawer.Screen
                  name="camera"
                  component={CameraStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="explore stack"
                  component={ExploreStackNavigator}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="network"
                  component={NetworkLogging}
                />
              </Drawer.Navigator>
            </ObsEditProvider>
          </PhotoGalleryProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

export default App;
