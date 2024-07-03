import { NavigationContainer, useRoute } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Linking } from "react-native";
import Photo from "realmModels/Photo";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  },
  ancestors: [{
    id: faker.number.int( ),
    preferred_common_name: faker.person.fullName( ),
    name: faker.person.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ),
    useNavigation: jest.fn( )
  };
} );

const renderTaxonDetails = ( ) => render(
  <INatPaperProvider>
    <NavigationContainer>
      <TaxonDetails />
    </NavigationContainer>
  </INatPaperProvider>
);

jest.mock(
  "../../../../src/sharedHooks/useAuthenticatedQuery",
  ( ) => ( {
    __esModule: true,
    default: ( queryKey, _queryFunction ) => {
      if ( queryKey[0] === "fetchTaxon" ) {
        return {
          data: mockTaxon,
          isLoading: false,
          isError: false
        };
      }
      return {
        data: null,
        isLoading: false,
        isError: false
      };
    }
  } )
);

describe( "TaxonDetails", ( ) => {
  beforeAll( ( ) => {
    useRoute.mockImplementation( ( ) => ( {
      params: { id: mockTaxon.id }
    } ) );
    jest.useFakeTimers( );
  } );

  test( "renders taxon details from API call", async ( ) => {
    renderTaxonDetails( );
    expect( screen.getByTestId( `TaxonDetails.${mockTaxon.id}` ) ).toBeTruthy( );
    const photo
      = await screen.findByTestId( `TaxonDetails.photo.${mockTaxon.taxonPhotos[0].photo.id}` );
    expect( photo.props.source )
      .toStrictEqual( { uri: Photo.displayMediumPhoto( mockTaxon.taxonPhotos[0].photo.url ) } );
    expect( screen.getByText( mockTaxon.wikipedia_summary ) ).toBeTruthy( );
  } );

  // fails because of image carousel
  // test( "should not have accessibility errors", ( ) => {
  //   const taxonDetails = <TaxonDetails />;
  //   expect( taxonDetails ).toBeAccessible( );
  // } );

  test( "navigates to Wikipedia on button press", async ( ) => {
    renderTaxonDetails( );
    fireEvent.press( screen.getByTestId( "TaxonDetails.wikipedia" ) );
    expect( Linking.openURL ).toHaveBeenCalledTimes( 1 );
    expect( Linking.openURL ).toHaveBeenCalledWith( mockTaxon.wikipedia_url );
  } );

  test( "does not show sticky select taxon button on default screen", ( ) => {
    renderTaxonDetails( );
    const selectTaxonButton = screen.queryByText( /SELECT THIS TAXON/ );
    expect( selectTaxonButton ).toBeFalsy( );
  } );
} );

describe( "TaxonDetails when coming from Suggestions screen", ( ) => {
  beforeAll( ( ) => {
    useRoute.mockImplementation( ( ) => ( {
      params: { id: mockTaxon.id, lastScreen: "Suggestions" }
    } ) );
  } );

  test( "shows sticky select taxon button when navigating from suggestions", ( ) => {
    renderTaxonDetails( );
    const selectTaxonButton = screen.getByText( /SELECT THIS TAXON/ );
    expect( selectTaxonButton ).toBeTruthy( );
  } );
} );
