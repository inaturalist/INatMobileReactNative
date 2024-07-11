import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

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

const makeUnsyncedObservations = options => ( [
  factory( "LocalObservation", {
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    geoprivacy: "obscured",
    ...options
  } )
] );

// const makeSyncedObservations = ( ) => ( [
//   factory( "LocalObservation", {
//     // Suggestions won't load without a photo
//     observationPhotos: [
//       factory( "LocalObservationPhoto", {
//         _synced_at: faker.date.past( ),
//         needsSync: jest.fn( ( ) => false ),
//         wasSynced: jest.fn( ( ) => true )
//       } )
//     ],
//     _synced_at: faker.date.past( ),
//     needsSync: jest.fn( ( ) => false ),
//     wasSynced: jest.fn( ( ) => true )
//   } )
// ] );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en"
} );

const topSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Primum suggestion" } ),
  combined_score: 90
};
const otherSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
  combined_score: 50
};

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsEdit to Suggestions for all of these
  // tests
  async function navigateToSuggestionsViaObsEditForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const addIdButton = observation.taxon
      ? await screen.findByLabelText( "Edit identification" )
      : await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  // async function navigateToSuggestionsViaObsDetailsForObservation( observation ) {
  //   const observationRow = await screen.findByTestId(
  //     `MyObservations.obsListItem.${observation.uuid}`
  //   );
  //   await actor.press( observationRow );
  //   const addIdButton = await screen.findByText( "SUGGEST ID" );
  //   await actor.press( addIdButton );
  // }

  beforeAll( async () => {
    await initI18next();
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  describe( "when reached from ObsEdit", ( ) => {
    // Mock the response from inatjs.computervision.score_image
    beforeEach( ( ) => {
      const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
    } );

    afterEach( ( ) => {
      inatjs.computervision.score_image.mockClear( );
      inatjs.observations.observers.mockClear( );
      inatjs.taxa.fetch.mockClear( );
    } );

    it(
      "should navigate back to ObsEdit with expected observation when top suggestion chosen",
      async ( ) => {
        const observations = makeUnsyncedObservations( );
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsViaObsEditForObservation( observations[0] );
        const topTaxonResultButton = await screen.findByTestId(
          `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
        );
        expect( topTaxonResultButton ).toBeTruthy( );
        await actor.press( topTaxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );

    it( "should navigate back to ObsEdit when another suggestion chosen", async ( ) => {
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      const otherTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${otherSuggestion.taxon.id}.checkmark`
      );
      expect( otherTaxonResultButton ).toBeTruthy( );
      await actor.press( otherTaxonResultButton );
      expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
    } );

    it( "should show the add ID later button if there's no taxon", async ( ) => {
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      expect( await screen.findByText( "Add an ID Later" ) ).toBeVisible( );
    } );

    it( "should not show the add ID later button if there is a taxon", async ( ) => {
      const observations = makeUnsyncedObservations( {
        taxon: factory( "LocalTaxon" )
      } );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      await screen.findByText( "TOP ID SUGGESTION" );
      expect( screen.queryByText( "Add an ID Later" ) ).toBeFalsy( );
    } );
  } );

  describe( "when reached from ObsDetails", ( ) => {
    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
    } );

    afterEach( ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
      inatjs.computervision.score_image.mockClear( );
      inatjs.observations.observers.mockClear( );
      inatjs.taxa.fetch.mockClear( );
    } );
    it.todo( "should not show the add ID later button" );
    // Note quite sure why this doesn't work, seems like realm gets deleted
    // while the component is still mounted for some reason
    //
    // it( "should not show the add ID later button", async ( ) => {
    //   const observations = makeSyncedObservations( );
    //   await renderAppWithObservations( observations, __filename );
    //   await navigateToSuggestionsViaObsDetailsForObservation( observations[0] );
    //   await screen.findByText( "TOP ID SUGGESTION" );
    //   expect( screen.queryByText( "Add an ID Later" ) ).toBeFalsy( );
    // } );
  } );

  describe( "TaxonSearch", ( ) => {
    it(
      "should navigate back to ObsEdit with expected observation"
      + " when reached from ObsEdit via Suggestions and search result chosen",
      async ( ) => {
        const observations = [
          factory( "LocalObservation", { geoprivacy: "obscured" } )
        ];
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsViaObsEditForObservation( observations[0] );
        const searchInput = await screen.findByLabelText( "Search for a taxon" );
        const mockSearchResultTaxon = factory( "RemoteTaxon" );
        inatjs.taxa.search.mockResolvedValue( makeResponse( [
          mockSearchResultTaxon
        ] ) );
        await act(
          async ( ) => actor.type(
            searchInput,
            "doesn't really matter since we're mocking the response"
          )
        );
        const taxonResultButton = await screen.findByTestId(
          `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
        );
        expect( taxonResultButton ).toBeTruthy( );
        await actor.press( taxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );
  } );
} );
