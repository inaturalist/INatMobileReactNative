import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react-native";
import ObsMedia from "components/ObsDetails/ObsMedia";
import initI18next from "i18n/initI18next";
import _ from "lodash";
import React from "react";
import factory from "tests/factory";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.url( )
      }
    } )
  ]
} );

const mockPhotos = _.compact(
  Array.from( mockObservation.observationPhotos ).map( op => op.photo )
);

const expectedImageSource = [
  {
    height: 75,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 75
  },
  {
    height: 240,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 240
  }, {
    height: 500,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 500
  },
  {
    height: 1024,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 1024
  }
];

describe( "ObsMedia", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  // it.todo( "should not have accessibility errors" );
  // it( "should not have accessibility errors", async () => {
  //   const ObsMedia = <ObsMedia photos={mockPhotos} />;
  //   expect( ObsMedia ).toBeAccessible( );
  // } );

  it( "should show photo with given url", async () => {
    render( <ObsMedia photos={mockPhotos} tablet={false} /> );
    const photo = await screen.findByTestId( "ObsMedia.photo" );
    expect( photo.props.source ).toStrictEqual( expectedImageSource );
  } );

  it( "should show photo with given url on tablet", async () => {
    render( <ObsMedia photos={mockPhotos} tablet /> );
    const photo = await screen.findByTestId( "ObsMedia.photo" );
    expect( photo.props.source ).toStrictEqual( expectedImageSource );
  } );
} );
