import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import ProjectDetails from "components/Projects/ProjectDetails";
import React from "react";

import factory from "../../../factory";

const mockProject = factory( "RemoteProject" );
const mockObservation = factory( "RemoteObservation" );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockProject.id
      }
    } )
  };
} );

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

const renderProjectDetails = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <ProjectDetails />
    </NavigationContainer>
  </QueryClientProvider>
);

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockObservation]
  } )
} ) );

test( "displays project observations", ( ) => {
  const { getByTestId, getByText } = renderProjectDetails( );

  expect( getByText( mockObservation.taxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByTestId( "ObsList.photo" ).props.source )
    .toStrictEqual( { uri: mockObservation.observation_photos[0].photo.url } );
} );
