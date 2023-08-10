import { render, screen } from "@testing-library/react-native";
import { IconicTaxonChooser } from "components/SharedComponents";
import React from "react";

import factory from "../../../factory";

const mockData = [factory( "RemoteTaxon" )];

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockData
  } )
} ) );

describe( "IconicTaxonChooser", () => {
  it( "should be accessible", () => {
    const mockTaxon = factory( "RemoteTaxon", {
      name: "Aves"
    } );
    expect(
      <IconicTaxonChooser taxon={mockTaxon} />
    ).toBeAccessible( );
  } );

  it( "should show an iconic taxa as selected", async ( ) => {
    const mockTaxon = factory( "RemoteTaxon", {
      name: "Plantae",
      iconic_taxon_name: "Plantae"
    } );

    render( <IconicTaxonChooser taxon={mockTaxon} /> );

    const plantButton = await screen.findByTestId(
      `IconicTaxonButton.${mockTaxon.name.toLowerCase( )}`
    );
    const birdButton = await screen.findByTestId( "IconicTaxonButton.aves" );

    expect( plantButton ).toHaveAccessibilityState( { selected: true } );
    expect( birdButton ).toHaveAccessibilityState( { selected: false } );
  } );
} );
