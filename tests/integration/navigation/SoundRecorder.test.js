import {
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import useStore from "stores/useStore";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

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
  useStore.setState( { isAdvancedUser: true } );
} );

describe( "SoundRecorder navigation", ( ) => {
  global.withAnimatedTimeTravelEnabled( );
  const actor = userEvent.setup( );

  describe( "from MyObs with advanced user layout", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      global.timeTravel( );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
      const tabBar = await screen.findByTestId( "CustomTabBar" );
      const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
      await actor.press( addObsButton );
      const recorderButton = await screen.findByLabelText( "Sound recorder" );
      await actor.press( recorderButton );
      const mediaNavButtons = await screen.findByTestId( "MediaNavButtons" );
      const closeButton = await within( mediaNavButtons ).findByLabelText( "Close" );
      await actor.press( closeButton );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
    } );
  } );
} );
