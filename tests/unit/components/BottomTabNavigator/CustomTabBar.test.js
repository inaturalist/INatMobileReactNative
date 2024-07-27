import {
  useNetInfo
} from "@react-native-community/netinfo";
import { screen } from "@testing-library/react-native";
import CustomTabBarContainer from "navigation/BottomTabNavigator/CustomTabBarContainer";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const initialPersistedStoreState = useStore.getState( );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  icon_url: faker.image.url( )
} );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: () => undefined
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: 0
  } )
} ) );

describe( "CustomTabBar", () => {
  beforeEach( ( ) => {
    jest.useFakeTimers();
  } );

  // it( "should render correctly", async () => {
  //   renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

  //   await expect( screen ).toMatchSnapshot();
  // } );

  it( "should not have accessibility errors", async () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    await expect( tabBar ).toBeAccessible();
  } );

  it( "should display person icon while user is logged out", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    await expect( personIcon ).toBeVisible( );
  } );

  it( "should display avatar while user is logged in", async () => {
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    const avatar = screen.getByTestId( "UserIcon.photo" );
    await expect( avatar ).toBeVisible( );
  } );

  it( "should display person icon when connectivity is low", async ( ) => {
    useNetInfo.mockImplementation( ( ) => ( { isInternetReachable: false } ) );
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    await expect( personIcon ).toBeVisible( );
  } );
} );

describe( "CustomTabBar with advanced user layout", () => {
  beforeAll( ( ) => {
    useStore.setState( { isAdvancedUser: true } );
  } );

  afterAll( ( ) => {
    useStore.setState( initialPersistedStoreState );
  } );

  beforeEach( ( ) => {
    jest.resetAllMocks();
    useNetInfo.mockImplementation( ( ) => ( { isInternetReachable: true } ) );
  } );

  it( "should render correctly", async () => {
    renderComponent( <CustomTabBarContainer navigation={jest.fn( )} /> );

    await expect( screen ).toMatchSnapshot();
  } );

  it( "should not have accessibility errors", async () => {
    const tabBar = <CustomTabBarContainer navigation={jest.fn( )} />;

    await expect( tabBar ).toBeAccessible();
  } );
} );
