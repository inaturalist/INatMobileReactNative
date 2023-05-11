import { render, screen } from "@testing-library/react-native";
import { DisplayTaxonName } from "components/SharedComponents";
import React from "react";

import factory from "../../factory";

const capitalizeFirstLetter = s => s.charAt( 0 ).toUpperCase( ) + s.slice( 1 );

const speciesTaxon = factory( "LocalTaxon", {
  name: "Chelonia mydas",
  preferred_common_name: "Green Sea Turtle",
  rank: "species",
  rank_level: 10
} );

const noCommonNameTaxon = factory( "LocalTaxon", {
  preferred_common_name: null,
  rank: "species",
  rank_level: 10
} );

const highRankTaxon = factory( "LocalTaxon", {
  preferred_common_name: null,
  rank_level: 27
} );

const subspeciesTaxon = factory( "LocalTaxon", {
  name: "Lupinus albifrons collinus",
  preferred_common_name: "Silver Lupine",
  rank: "variety",
  rank_level: 9
} );

const uncapitalizedTaxon = factory( "LocalTaxon", {
  name: "Acanthaster planci",
  preferred_common_name: "cRoWn-Of-ThOrNs blue sEa-StarS",
  rank: "species",
  rank_level: 10
} );

describe( "when common name is first", ( ) => {
  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName taxon={speciesTaxon} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${speciesTaxon.preferred_common_name} ${speciesTaxon.name}`
    );
  } );

  test( "renders correct taxon w/o common name", ( ) => {
    render( <DisplayTaxonName taxon={noCommonNameTaxon} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      noCommonNameTaxon.name
    );
  } );

  test( "renders correct taxon w/o common name and no species", ( ) => {
    render( <DisplayTaxonName taxon={highRankTaxon} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
    );
  } );

  test( "renders correct taxon for a subfamily", ( ) => {
    render( <DisplayTaxonName taxon={highRankTaxon} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
    );
  } );

  test( "renders correct taxon for subspecies", ( ) => {
    render( <DisplayTaxonName taxon={subspeciesTaxon} /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Silver Lupine Lupinus albifrons var. collinus"
    );
  } );

  test( "renders correct taxon for improperly capitalized common name", ( ) => {
    render( <DisplayTaxonName taxon={uncapitalizedTaxon} /> );
    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Crown-of-thorns Blue Sea-Stars Acanthaster planci"
    );
  } );

  test( "renders correct taxon for species in grid view", ( ) => {
    render( <DisplayTaxonName layout="vertical" taxon={subspeciesTaxon} /> );
    // Grid view should not have a space between text
    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Silver LupineLupinus albifrons var. collinus"
    );
  } );
} );

describe( "when scientific name is first", ( ) => {
  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName taxon={speciesTaxon} scientificNameFirst /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${speciesTaxon.name} ${speciesTaxon.preferred_common_name}`
    );
  } );

  test( "renders correct taxon w/o common name", ( ) => {
    render( <DisplayTaxonName taxon={noCommonNameTaxon} scientificNameFirst /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      noCommonNameTaxon.name
    );
  } );

  test( "renders correct taxon w/o common name and no species", ( ) => {
    render( <DisplayTaxonName taxon={highRankTaxon} scientificNameFirst /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${capitalizeFirstLetter( highRankTaxon.rank )} ${highRankTaxon.name}`
    );
  } );

  test( "renders correct taxon for species", ( ) => {
    render( <DisplayTaxonName taxon={subspeciesTaxon} scientificNameFirst /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Lupinus albifrons var. collinus Silver Lupine"
    );
  } );

  test( "renders correct taxon for species in grid view", ( ) => {
    render(
      <DisplayTaxonName
        layout="vertical"
        taxon={subspeciesTaxon}
        scientificNameFirst
      />
    );

    // Grid view should not have a space between text
    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      "Lupinus albifrons var. collinusSilver Lupine"
    );
  } );
} );
