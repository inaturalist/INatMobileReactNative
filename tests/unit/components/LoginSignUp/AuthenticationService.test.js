import nock from "nock";

import {
  API_HOST,
  authenticateUser,
  getAPIToken,
  getUsername,
  isLoggedIn,
  registerUser,
  signOut
} from "../../../../src/components/LoginSignUp/AuthenticationService";
import factory from "../../../factory";

const USERNAME = "some_user";
const PASSWORD = "123456";
const ACCESS_TOKEN = "some_token";
const ACCESS_TOKEN_AUTHORIZATION_HEADER = `Bearer ${ACCESS_TOKEN}`;
const JWT = "jwt_token";
const USERID = 113113;

const testUser = factory( "RemoteUser" );
const mockExpected = testUser;

jest.mock( "../../../../src/components/UserProfile/hooks/useUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    user: mockExpected,
    currentUser: null
  } )
} ) );

test( "authenticates user", async ( ) => {
  const scope = nock( API_HOST )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME, id: USERID } );

  const scope2 = nock( API_HOST, {
    reqheaders: {
      authorization: ACCESS_TOKEN_AUTHORIZATION_HEADER
    }
  } )
    .get( "/users/api_token.json" )
    .reply( 200, { api_token: JWT } );

  // Authenticate the user
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( authenticateUser( USERNAME, PASSWORD ) ).resolves.toEqual( true );

  // Make sure user is logged in
  await expect( getUsername() ).resolves.toEqual( USERNAME );
  await expect( isLoggedIn() ).resolves.toEqual( true );

  // Make sure access token is returned correctly in all different cases (with/without JWT)
  await expect( getAPIToken( false ) ).resolves.toEqual( ACCESS_TOKEN_AUTHORIZATION_HEADER );
  await expect( getAPIToken( true ) ).resolves.toEqual( JWT );

  // Sign out
  await signOut();
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( getAPIToken() ).resolves.toBeNull();

  scope.done();
  scope2.done();
} );

test( "registers user", async ( ) => {
  const scope = nock( API_HOST )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME, id: USERID } )
    .post( "/users.json" )
    .reply( 200 );

  // Register the user
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( registerUser( "some@mail.com", USERNAME, PASSWORD ) ).resolves.toBeNull( );

  // Log back in
  await expect( authenticateUser( USERNAME, PASSWORD ) ).resolves.toEqual( true );

  // Make sure user is logged in
  await expect( getUsername() ).resolves.toEqual( USERNAME );
  await expect( isLoggedIn() ).resolves.toEqual( true );
  await expect( getAPIToken( false ) ).resolves.toEqual( ACCESS_TOKEN_AUTHORIZATION_HEADER );

  // Sign out
  await signOut();
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( getAPIToken() ).resolves.toBeNull();

  scope.done();
} );
