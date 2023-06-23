import { screen } from "@testing-library/react-native";
import ProjectObservations from "components/Projects/ProjectObservations";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockProject = factory( "RemoteProject" );
const mockObservation = factory( "RemoteObservation", {
  taxon: { preferred_common_name: "Foo", name: "bar" }
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockProject.id
      }
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    data: [mockObservation]
  } )
} ) );

describe( "ProjectObservations", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "should not have accessibility errors", async ( ) => {
    renderComponent( <ProjectObservations /> );
    const projectObservations = await screen.findByTestId( "ProjectObservations.grid" );
    expect( projectObservations ).toBeAccessible();
  } );

  test( "displays project observations", ( ) => {
    renderComponent( <ProjectObservations /> );

    expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
      `${
        mockObservation.taxon.preferred_common_name
      }${
        mockObservation.taxon.rank.charAt( 0 ).toUpperCase()
        + mockObservation.taxon.rank.slice( 1 )
      } ${
        mockObservation.taxon.name
      }`
    );
    expect( screen.getByTestId( "ObsList.photo" ).props.source ).toStrictEqual( {
      uri: mockObservation.observation_photos[0].photo.url
    } );
  } );
} );
