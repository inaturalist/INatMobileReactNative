import { fireEvent, screen } from "@testing-library/react-native";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import i18next from "i18next";
import React from "react";
import * as useTaxonSearch from "sharedHooks/useTaxonSearch";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

jest.mock(
  "components/SharedComponents/ViewWrapper",
  () => function MockViewWrapper( props ) {
    const MockName = "mock-view-no-footer";
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <MockName {...props} testID={MockName}>
        {props.children}
      </MockName>
    );
  }
);

const mockTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

const mockIconicTaxaList = [
  factory( "RemoteTaxon" ),
  factory( "RemoteTaxon" )
];

jest.mock( "sharedHooks/useIconicTaxa", () => ( {
  __esModule: true,
  default: ( ) => ( mockIconicTaxaList )
} ) );

jest.mock( "sharedHooks/useTaxonSearch", () => ( {
  __esModule: true,
  default: ( ) => ( { taxaSearchResults: mockTaxaList, isLoading: false } )
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockTaxaList[0] } )
} ) );

// react-native-paper's TextInput does a bunch of async stuff that's hard to
// control in a test, so we're just mocking it here.
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockTextInput = props => {
    const MockName = "mock-text-input";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  };
  MockTextInput.Icon = RealModule.TextInput.Icon;
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-props-no-spreading
    // TextInput: props => <View {...props}>{props.children}</View>
    TextInput: MockTextInput
  };
  return MockedModule;
} );

describe( "TaxonSearch", ( ) => {
  test( "should not have accessibility errors", async ( ) => {
    const taxonSearch = (
      <TaxonSearch />
    );
    expect( taxonSearch ).toBeAccessible( );
  } );

  it( "should render inside mocked container", ( ) => {
    renderComponent( <TaxonSearch /> );
    expect( screen.getByTestId( "mock-view-no-footer" ) ).toBeTruthy();
  } );

  it( "should fallback to iconic taxa ", async ( ) => {
    jest.spyOn( useTaxonSearch, "default" ).mockImplementation( () => (
      { taxonList: undefined, isLoading: false } ) );
    renderComponent( <TaxonSearch /> );
    const taxon = mockIconicTaxaList[0];
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
  } );

  it( "show taxon search results", async ( ) => {
    jest.spyOn( useTaxonSearch, "default" ).mockImplementation( () => (
      { taxaSearchResults: mockTaxaList, isLoading: false } ) );
    renderComponent( <TaxonSearch /> );
    const input = screen.getByTestId( "SearchTaxon" );
    const taxon = mockTaxaList[0];
    fireEvent.changeText( input, "Some taxon" );
    expect( await screen.findByTestId( `Search.taxa.${taxon.id}` ) ).toBeTruthy();
  } );

  it( "should render with no initial comment state", ( ) => {
    renderComponent( <TaxonSearch /> );
    const commentSection = screen.queryByText(
      i18next.t( "Your-identification-will-be-posted-with-the-following-comment" )
    );
    expect( commentSection ).toBeFalsy( );
  } );

  describe( "while loading", () => {
    test( "should not show taxon results", async () => {
      jest.spyOn( useTaxonSearch, "default" ).mockImplementation( () => (
        { taxonList: undefined, isLoading: true } ) );
      renderComponent( <TaxonSearch /> );
      const input = screen.getByTestId( "SearchTaxon" );
      const taxon = mockTaxaList[0];
      const iconicTaxon = mockIconicTaxaList[0];
      fireEvent.changeText( input, "Some taxon" );
      expect( screen.queryByTestId( `Search.taxa.${taxon.id}` ) ).not.toBeTruthy();
      expect( screen.queryByTestId( `Search.taxa.${iconicTaxon.id}` ) ).not.toBeTruthy();
    } );
  } );
} );
