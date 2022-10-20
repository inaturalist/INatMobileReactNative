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

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockProject
  } )
} ) );

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

const queryClient = new QueryClient( );

const renderProjectDetails = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <ProjectDetails />
    </NavigationContainer>
  </QueryClientProvider>
);

test( "displays project details", ( ) => {
  const { getByTestId, getByText } = renderProjectDetails( );

  expect( getByText( mockProject.title ) ).toBeTruthy( );
  expect( getByText( mockProject.description ) ).toBeTruthy( );
  expect(
    getByTestId( "ProjectDetails.headerImage" ).props.source
  ).toStrictEqual( { uri: mockProject.header_image_url } );
  expect(
    getByTestId( "ProjectDetails.projectIcon" ).props.source
  ).toStrictEqual( { uri: mockProject.icon } );
} );
