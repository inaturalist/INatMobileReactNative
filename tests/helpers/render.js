import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import App from "components/App";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Observation from "realmModels/Observation";

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      // No need to do default retries in tests
      retry: false,
      // Prevent `Jest did not exit one second after the test run has completed.` error
      // https://react-query-v3.tanstack.com/guides/testing#set-cachetime-to-infinity-with-jest
      cacheTime: Infinity
    }
  }
} );

function renderComponent( component, update = null ) {
  const renderMethod = update || render;
  return renderMethod(
    <QueryClientProvider client={queryClient}>
      <INatPaperProvider>
        <GestureHandlerRootView className="flex-1">
          <BottomSheetModalProvider>
            <NavigationContainer>
              { component }
            </NavigationContainer>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </INatPaperProvider>
    </QueryClientProvider>
  );
}

function renderAppWithComponent( component, update = null ) {
  return renderComponent( <App>{ component }</App>, update );
}

function renderApp( update = null ) {
  return renderAppWithComponent( null, update );
}

async function renderAppWithObservations(
  observations: Array,
  realmIdentifier: string
): any {
  if ( observations.length > 0 ) {
    await Promise.all( observations.map( async observation => {
      // If it looks like it was supposed to be unsynced, save it like a new
      // local obs
      if ( observation.needsSync && observation.needsSync( ) ) {
        // Save the mock observation in Realm
        return Observation.saveLocalObservationForUpload(
          observations[0],
          global.mockRealms[realmIdentifier]
        );
      }
      // Otherwise save it like a remote obs
      return new Promise( resolve => {
        resolve(
          Observation.upsertRemoteObservations( [observation], global.mockRealms[realmIdentifier] )
        );
      } );
    } ) );
  }
  // Render the whole app with all the navigators
  renderAppWithComponent( );
  // If we don't wait for the obs to render we get errors about things
  // happening outside of act(). Most tests will do this anyway, but this
  // caused me a lot of confusion when I was trying to debug other problems
  // by removing code until I was just rendering the stack navigator... and
  // that was still erroring out. Hopefully this will prevent that particular
  // point of confusion in the future. ~~~kueda 20240104
  await screen.findByTestId( `MyObservations.obsListItem.${observations[0].uuid}` );
}

export {
  renderApp,
  renderAppWithComponent,
  renderAppWithObservations,
  renderComponent
};
