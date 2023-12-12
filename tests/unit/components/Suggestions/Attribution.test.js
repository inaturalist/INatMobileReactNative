import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import Attribution from "components/Suggestions/Attribution";
import initI18next from "i18n/initI18next";
import React from "react";

import { renderComponent } from "../../../helpers/render";

const mockObservers = [
  faker.person.fullName( ), faker.person.fullName( ), faker.person.fullName( )
];

const renderAttribution = ( ) => renderComponent(
  <Attribution
    observers={mockObservers}
  />
);

describe( "Attribution", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should show attributions", async ( ) => {
    renderAttribution( );
    const observerName = screen.getByText( new RegExp( mockObservers[0] ) );
    expect( observerName ).toBeVisible( );
  } );
} );
