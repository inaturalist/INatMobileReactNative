import { fireEvent, screen } from "@testing-library/react-native";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../../../factory";
import { renderComponent } from "../../../helpers/render";
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

jest.mock( "components/Suggestions/hooks/useTaxonSearch", () => ( {
  __esModule: true,
  default: ( ) => mockTaxaList
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => mockTaxaList[0]
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
  beforeAll( async ( ) => {
    await initI18next( );
  } );

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

  it( "show taxon search results", async ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( mockTaxaList ) );
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
} );
