// ComponentUnderTest.perf-test.tsx
import { faker } from "@faker-js/faker";
import MyObservations from "components/MyObservations/MyObservations";
import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { measurePerformance } from "reassure";
import factory from "../factory";
import { fireEvent } from '@testing-library/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import initI18next from "i18n/initI18next";

jest.setTimeout(60_000);

const mockUser = factory( "LocalUser" );

const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.datatype.number( ),
          url: faker.image.imageUrl( ),
          position: 0
        }
      } )
    ]
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.datatype.number( ),
          url: `${faker.image.imageUrl( )}/100`,
          position: 0
        }
      } ),
      factory( "LocalObservationPhoto", {
        photo: {
          id: faker.datatype.number( ),
          url: `${faker.image.imageUrl( )}/200`,
          position: 1
        }
      } )
    ]
  } )
];

const mockOnEndReached = jest.fn( );

jest.mock( "sharedHooks/useInfiniteObservationsScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockObservations,
    isFetchingNextPage: false,
    fetchNextPage: mockOnEndReached
  } )
} ) );

jest.mock( "sharedHooks/useObservationsUpdates", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    refetch: jest.fn()
  } ) )
} ) );

describe( "MyObservations Performance", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  test( "Test list loading time in MyObservations", async () => {
    await measurePerformance( <MyObservations
      observations={mockObservations}
      layout="list"
      toggleLayout={jest.fn( )}
      allObsToUpload={[]}
      showLoginSheet={false}
      setShowLoginSheet={jest.fn( )}
      isFetchingNextPage={false}
      onEndReached={mockOnEndReached}
      currentUser={mockUser}
      isOnline
    /> );
  } );
} );
