import { faker } from "@faker-js/faker";
import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import os from "os";
import path from "path";
import Realm from "realm";
import realmConfig from "realmModels/index";

import factory from "../../factory";
import {
  renderObservationsStackNavigatorWithObservations
} from "../../helpers/render";
import { signIn, signOut } from "../../helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// This is a bit crazy, but this ensures this test uses its own in-memory
// database and doesn't interfere with the single, default in-memory database
// used by other tests. In a perfect world, every parallel test worker would
// have its own database, or at least this wouldn't be so manual, but it took
// me long enough to figure this out. ~~~kueda 20231024
// REALM SETUP
const mockRealmConfig = {
  schema: realmConfig.schema,
  schemaVersion: realmConfig.schemaVersion,
  // No need to actually write to disk
  inMemory: true,
  // For an in memory db path is basically a unique identifier, *but* Realm
  // may still write some metadata to disk, so this needs to be a real, but
  // temporary, path. In theory this should prevent this test from
  // interacting with other tests
  path: path.join( os.tmpdir( ), `${path.basename( __filename )}.realm` )
};

// Mock the config so that all code that runs during this test talks to the same database
jest.mock( "realmModels/index", ( ) => ( {
  __esModule: true,
  default: mockRealmConfig
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[__filename]
    }
  };
} );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

describe( "ObsEdit", ( ) => {
  const actor = userEvent.setup( );

  async function findAndPressById( labelText ) {
    const pressable = await screen.findByTestId( labelText );
    await actor.press( pressable );
    return pressable;
  }

  const mockUser = factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } );

  beforeAll( async () => {
    await initI18next();
    jest.useFakeTimers( );
  } );

  describe( "from MyObservations", ( ) => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      taxon: factory( "LocalTaxon", {
        name: faker.person.firstName( )
      } )
    } );

    async function navigateToObsEditOrObsDetails( observations ) {
      await renderObservationsStackNavigatorWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observations[0].uuid}`
      );
      await actor.press( observationRow );
    }

    it( "should show correct observation when navigating from MyObservations", async ( ) => {
      const observations = [observation];
      await navigateToObsEditOrObsDetails( observations );
      expect( await screen.findByText( /Edit Observation/ ) ).toBeTruthy( );
      expect( await screen.findByText( observations[0].taxon.name ) ).toBeTruthy( );
    } );

    describe( "while signed in", ( ) => {
      beforeEach( async ( ) => {
        await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      } );

      afterEach( ( ) => {
        signOut( { realm: global.mockRealms[__filename] } );
      } );

      it( "should show correct observation when navigating from ObsDetails", async ( ) => {
        const syncedObservation = factory( "LocalObservation", {
          _created_at: faker.date.past( ),
          _synced_at: faker.date.past( ),
          wasSynced: jest.fn( ( ) => true ),
          needsSync: jest.fn( ( ) => false ),
          taxon: factory( "LocalTaxon", {
            name: faker.person.firstName( )
          } )
        } );
        await navigateToObsEditOrObsDetails( [syncedObservation] );
        await findAndPressById( "ObsDetail.editButton" );
        expect( await screen.findByText( /Edit Observation/ ) ).toBeTruthy( );
        expect( await screen.findByText( syncedObservation.taxon.name ) ).toBeTruthy( );
      } );
    } );
  } );
} );
