import {
  fireEvent,
  screen
} from "@testing-library/react-native";
import { UserListItem } from "components/SharedComponents";
import faker from "tests/helpers/faker";

import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "RemoteUser", {
  login: "test123",
  id: faker.number.int( )
} );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate
    } )
  };
} );

describe( "UserListItem", ( ) => {

  it( "should be accessible", ( ) => {
    const userListItem = (
      <UserListItem
        item={{
          user: mockUser
        }}
        count={3}
        countText="X-Observations"
      />
    );
    expect( userListItem ).toBeAccessible();
  } );

  it( "should navigate to user profile on tap", ( ) => {
    renderComponent( <UserListItem
      item={{
        user: mockUser
      }}
    /> );
    fireEvent.press( screen.getByTestId( `UserProfile.${mockUser.id}` ) );
    expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", { userId: mockUser.id } );
  } );
} );
