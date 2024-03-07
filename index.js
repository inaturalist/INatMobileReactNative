// @flow

// React Native doesn't have a functional URL as of Feb 2024
import "react-native-url-polyfill/auto";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import App from "components/App";
import ErrorBoundary from "components/ErrorBoundary";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import INatPaperProvider from "providers/INatPaperProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { Alert, AppRegistry } from "react-native";
import Config from "react-native-config";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableLatestRenderer } from "react-native-maps";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { reactQueryRetry } from "sharedHelpers/logging";

import { name as appName } from "./app.json";
import { log } from "./react-native-logs.config";
import { getUserAgent } from "./src/api/userAgent";
import { navigationRef } from "./src/navigation/navigationUtils";

enableLatestRenderer( );

const logger = log.extend( "index.js" );

// I'm not convinced this ever catches anything... ~~~kueda 20240110
const jsErrorHandler = ( e, isFatal ) => {
  logger.info( "[DEBUG index.js] jsErrorHandler called with error: ", e );
  // not 100% sure why jsErrorHandler logs e.name and e.message as undefined sometimes,
  // but I believe it relates to this issue, which reports an unnecessary console.error
  // under the hood: https://github.com/a7ul/react-native-exception-handler/issues/143

  // possibly also related to error boundaries in React 16+:
  // https://github.com/a7ul/react-native-exception-handler/issues/60
  // if ( !e.name && !e.message ) return;
  if ( isFatal ) {
    logger.error( `JS Error: Fatal: ${e.stack}` );
    Alert.alert( "D'OH", `${e.message}\n\n${e.stack}` );
  } else {
    logger.error( `JS Error: ${e.stack}` );
  }
};

// record JS exceptions; second parameter allows this to work in DEV mode
setJSExceptionHandler( jsErrorHandler, true );

// record native exceptions
// only works in bundled mode; will show red screen in dev mode
// tested this by raising an exception in RNGestureHandler.m
// https://stackoverflow.com/questions/63270492/how-to-raise-native-error-in-react-native-app
// https://github.com/a7ul/react-native-exception-handler#react-native-navigation-wix
setNativeExceptionHandler( exceptionString => {
  logger.error( `Native Error: ${exceptionString}` );
}, false );

startNetworkLogging();

initI18next();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL,
  userAgent: getUserAgent()
} );

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      retry: reactQueryRetry
    }
  }
} );

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <INatPaperProvider>
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              {/* NavigationContainer needs to be nested above ObsEditProvider */}
              <NavigationContainer ref={navigationRef}>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </NavigationContainer>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </INatPaperProvider>
      </SafeAreaProvider>
    </RealmProvider>
  </QueryClientProvider>

);

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
