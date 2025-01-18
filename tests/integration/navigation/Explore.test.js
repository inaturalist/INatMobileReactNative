import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import ReactNativePermissions from "react-native-permissions";
import Observation from "realmModels/Observation";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut, TEST_JWT } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
  species_count: faker.number.int(),
  created_at: "2000-05-09T01:17:05-01:00",
  updated_at: "2000-05-09T01:17:05-01:00"
} );

const mockTaxon = factory( "LocalTaxon" );

const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    user: mockUser,
    taxon: mockTaxon
  } )
];

const mockFetchUserLocation = jest.fn( () => ( { latitude: 37, longitude: 34 } ) );
jest.mock( "sharedHelpers/fetchUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon
  }] ) );
  inatjs.observations.search.mockImplementation( ( params, _opts ) => {
    // If this is from MyObs trying to get the signed in user's obs, return nothing
    if ( params.user_id && !params.verifiable ) {
      return makeResponse( [] );
    }
    // But if it's from Explore, we want to show observations
    return makeResponse( mockObservations );
  } );
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockTaxon] ) );
} );

const actor = userEvent.setup( );

async function navigateToObsDetails( ) {
  await waitFor( ( ) => {
    global.timeTravel( );
    expect( screen.getByText( /Welcome back/ ) ).toBeVisible( );
  } );
  const firstObservation = await screen.findByTestId(
    `ObsPressable.${mockObservations[0].uuid}`
  );
  await actor.press( firstObservation );
}

async function navigateToRootExplore( ) {
  const welcomeBack = await screen.findByText( /Welcome back/ );
  await waitFor( ( ) => expect( welcomeBack ).toBeVisible( ) );
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const exploreButton = await within( tabBar ).findByText( "Explore" );
  await actor.press( exploreButton );
}

describe( "logged in", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( async ( ) => {
    await signOut( { realm: global.mockRealms[__filename] } );
  } );

  describe( "from MyObs", ( ) => {
    beforeEach( ( ) => {
      // Write mock observation to realm
      Observation.upsertRemoteObservations( mockObservations, global.mockRealms[__filename] );
    } );

    global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

    describe( "from MyObs toolbar", ( ) => {
      it( "should show observations view and navigate back to MyObs", async ( ) => {
        renderApp( );
        await waitFor( ( ) => {
          global.timeTravel( );
          expect( screen.getByText( /Welcome back/ ) ).toBeVisible( );
        } );
        const exploreButton = await screen.findByLabelText( /See all your observations in explore/ );
        await actor.press( exploreButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
      } );
    } );

    describe( "from TaxonDetails", ( ) => {
      it( "should show observations view and navigate back to TaxonDetails", async ( ) => {
        renderApp( );
        await navigateToObsDetails( );
        const taxonPressable = await screen.findByTestId(
          `ObsDetails.taxon.${mockObservations[0].taxon.id}`
        );
        await actor.press( taxonPressable );
        const exploreButton = await screen.findByLabelText( /See observations of this taxon in explore/ );
        await actor.press( exploreButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          taxon_id: mockTaxon.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( exploreButton ).toBeVisible( );
      } );
    } );

    describe( "from UserProfile observations button", ( ) => {
      beforeEach( async ( ) => {
        // Write mock observation to realm
        Observation.upsertRemoteObservations( mockObservations, global.mockRealms[__filename] );
        inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
        inatjs.relationships.search.mockResolvedValue( makeResponse( {
          results: []
        } ) );
      } );

      it( "should show observations view and navigate back to UserProfile", async ( ) => {
        renderApp( );
        await navigateToObsDetails( );
        const userProfileButton = await screen.findByLabelText(
          `User ${mockObservations[0].user.login}`
        );
        await actor.press( userProfileButton );
        expect( inatjs.users.fetch ).toHaveBeenCalled( );
        const observationsButton = await screen.findByLabelText( /See observations by this user in Explore/ );
        await actor.press( observationsButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = await screen.findByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        const journalPostsButton = await screen.findByText( /JOURNAL POSTS/ );
        await actor.press( journalPostsButton );
      } );
    } );

    describe( "from UserProfile species button", ( ) => {
      beforeEach( async ( ) => {
        // Write mock observation to realm
        Observation.upsertRemoteObservations( mockObservations, global.mockRealms[__filename] );

        inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
        inatjs.relationships.search.mockResolvedValue( makeResponse( {
          results: []
        } ) );
      } );

      it( "should show species view and navigate back to UserProfile", async ( ) => {
        renderApp( );
        await navigateToObsDetails( );
        const userProfileButton = await screen.findByLabelText(
          `User ${mockObservations[0].user.login}`
        );
        await actor.press( userProfileButton );
        expect( inatjs.users.fetch ).toHaveBeenCalled( );
        const speciesButton = await screen.findByLabelText( /See species observed by this user in Explore/ );
        await actor.press( speciesButton );
        expect( inatjs.observations.speciesCounts ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const speciesViewIcon = await screen.findByLabelText( /Species View/ );
        expect( speciesViewIcon ).toBeVisible( );
        const backButton = await screen.findByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        const journalPostsButton = await screen.findByText( /JOURNAL POSTS/ );
        await actor.press( journalPostsButton );
      } );
    } );
  } );

  describe( "from bottom tab navigator Explore button", ( ) => {
    describe( "from RootExplore -> X -> Explore -> back", ( ) => {
      it( "should navigate from TaxonDetails to Explore and back to TaxonDetails", async ( ) => {
        renderApp( );
        await navigateToRootExplore( );
        const speciesViewIcon = await screen.findByLabelText( /Species View/ );
        expect( speciesViewIcon ).toBeVisible( );
        const firstTaxon = await screen.findByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` );
        await actor.press( firstTaxon );
        const taxonDetailsExploreButton = await screen.findByLabelText( /See observations of this taxon in explore/ );
        await actor.press( taxonDetailsExploreButton );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( taxonDetailsExploreButton ).toBeVisible( );
      } );

      it( "should navigate from UserProfile to Explore and back to UserProfile", async ( ) => {
        inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
        inatjs.relationships.search.mockResolvedValue( makeResponse( {
          results: []
        } ) );
        inatjs.observations.fetch.mockResolvedValue( makeResponse( mockObservations ) );
        renderApp( );
        await navigateToRootExplore( );
        const speciesViewIcon = await screen.findByLabelText( /Species View/ );
        await actor.press( speciesViewIcon );
        const observationsRadioButton = await screen.findByText( "Observations" );
        await actor.press( observationsRadioButton );
        const confirmButton = await screen.findByText( /EXPLORE OBSERVATIONS/ );
        await actor.press( confirmButton );
        const headerCount = await screen.findByText( /1 Observation/ );
        expect( headerCount ).toBeVisible( );
        const gridView = await screen.findByTestId( "SegmentedButton.grid" );
        await actor.press( gridView );
        const firstObservation = screen.queryByTestId(
          `ObsPressable.${mockObservations[0].uuid}`
        );
        await waitFor( ( ) => {
          expect( firstObservation ).toBeVisible( );
        }, { timeout: 10_000 } );
        await actor.press( firstObservation );
        await waitFor( ( ) => {
          expect( screen.getByTestId( `ObsDetails.${mockObservations[0].uuid}` ) ).toBeVisible( );
        }, { timeout: 10_000 } );
        const userProfileButton = await screen.findByLabelText( `User ${mockUser.login}` );
        await actor.press( userProfileButton );
        const observationsButton = await screen.findByLabelText( /See observations by this user in Explore/ );
        await actor.press( observationsButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( observationsButton ).toBeVisible( );
      } );
    } );

    describe( "without location permissions", ( ) => {
      it( "should default to global species view and not have a back button", async ( ) => {
        const mockedPermissions = {
          "ios.permission.LOCATION": "denied"
        };

        jest.spyOn( ReactNativePermissions, "checkMultiple" )
          .mockResolvedValueOnce( mockedPermissions );

        renderApp( );
        await navigateToRootExplore( );
        const speciesViewIcon = await screen.findByLabelText( /Species View/ );
        expect( speciesViewIcon ).toBeVisible( );
        const defaultNearbyLocationText = await screen.findByText( /Nearby/ );
        expect( defaultNearbyLocationText ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        expect( backButton ).toBeFalsy( );
      } );
    } );

    describe( "with location permissions", ( ) => {
      it.todo( "should default to nearby location" );
      // it( "should default to nearby location", async ( ) => {
      //   const mockedPermissions = {
      //     "ios.permission.LOCATION": "granted"
      //   };

      //   jest.spyOn( ReactNativePermissions, "checkMultiple" )
      //     .mockResolvedValueOnce( mockedPermissions );
      //   renderApp( );
      //   await navigateToRootExplore( );
      //   const speciesViewIcon = await screen.findByLabelText( /Species View/ );
      //   expect( speciesViewIcon ).toBeVisible( );
      //   const nearbyText = await screen.findByText( /Nearby/ );
      //   expect( nearbyText ).toBeVisible( );
      // } );
    } );
  } );
} );
