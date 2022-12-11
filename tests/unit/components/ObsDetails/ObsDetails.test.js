import { fireEvent } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockNavigate = jest.fn( );
const mockObservation = factory( "LocalObservation" );
const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } ),
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      addListener: jest.fn( ),
      setOptions: jest.fn( )
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockObservation
  } )
} ) );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: ( ) => null
  } )
} ) );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockObservation.user.id
} ) );

jest.mock( "components/ObsDetails/AddCommentModal" );

test( "renders obs details from remote call", async ( ) => {
  const { getByTestId, getByText, findByTestId } = renderComponent( <ObsDetails /> );

  expect( await findByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
  expect(
    getByTestId( "PhotoScroll.photo" ).props.source
  ).toStrictEqual( { uri: mockObservation.observationPhotos[0].photo.url } );
  expect( getByText( mockObservation.taxon.name ) ).toBeTruthy( );
  // TODO: figure out how to test elements which are mapped to camelCase via
  // Observation model right now, these elements are not rendering in
  // renderComponent( <ObsDetails />  ).debug( ) at all
} );

test( "renders data tab on button press", async ( ) => {
  const { getByText, findByTestId } = renderComponent( <ObsDetails /> );
  const button = await findByTestId( "ObsDetails.DataTab" );

  fireEvent.press( button );
  expect( getByText( mockObservation.description ) ).toBeTruthy( );
} );

test( "navigates to observer profile on button press", async ( ) => {
  const { findByTestId } = renderComponent( <ObsDetails /> );

  fireEvent.press( await findByTestId( "ObsDetails.currentUser" ) );
  expect( mockNavigate )
    .toHaveBeenCalledWith( "UserProfile", { userId: mockObservation.user.id } );
} );

test( "navigates to identifier profile on button press", async ( ) => {
  const { findByTestId } = renderComponent( <ObsDetails /> );

  fireEvent.press(
    await findByTestId(
      `ObsDetails.identifier.${mockObservation.identifications[0].user.id}`
    )
  );
  expect( mockNavigate ).toHaveBeenCalledWith( "UserProfile", {
    userId: mockObservation.identifications[0].user.id
  } );
} );

test( "navigates to taxon details on button press", async ( ) => {
  const { findByTestId } = renderComponent( <ObsDetails /> );

  fireEvent.press( await findByTestId( `ObsDetails.taxon.${mockObservation.taxon.id}` ) );
  expect( mockNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
    id: mockObservation.taxon.id
  } );
} );

test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const obsDetails = (
//     <NavigationContainer>
//       <ObsDetails />
//     </NavigationContainer>
//   );
//   expect( obsDetails ).toBeAccessible( );
// } );
