import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const mockLocationName = "San Francisco, CA";

const mockCurrentUser = factory( "LocalUser" );

const mockObservations = [
  factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser,
    place_guess: mockLocationName
  } )
];

const observationPhotos = [
  factory( "RemoteObservationPhoto", {
    photo: {
      url: faker.image.url( )
    },
    position: 0
  } ),
  factory( "RemoteObservationPhoto", {
    photo: {
      url: `${faker.image.url( )}/100`
    },
    position: 1
  } )
];

const photos = observationPhotos.map( obsPhoto => obsPhoto.photo );

const mockObservation = factory( "RemoteObservation", {
  speciesGuess: "Obsedit test",
  observationPhotos
} );

const renderObsEdit = ( ) => renderComponent( <ObsEdit /> );

describe( "ObsEdit", () => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
    await initI18next( );
  } );

  it( "should not have accessibility errors", async () => {
    renderObsEdit( mockObservations );

    const obsEdit = await screen.findByTestId( "obs-edit" );
    expect( obsEdit ).toBeAccessible();
  } );

  it( "displays the number of photos in global state obsPhotos", async ( ) => {
    useStore.setState( {
      currentObservation: mockObservation,
      observations: [mockObservation]
    } );
    renderComponent( <ObsEdit /> );

    const evidenceList = screen.getByTestId( "EvidenceList.DraggableFlatList" );

    await waitFor( ( ) => {
      expect( evidenceList ).toHaveProp( "data", photos );
    } );
  } );
} );
