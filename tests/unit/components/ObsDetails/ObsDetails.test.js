import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsDetails from "../../../../src/components/ObsDetails/ObsDetails";

const testObservation = factory( "LocalObservation" );

const mockExpected = testObservation;
// TODO: learn how to mock a default export
jest.mock( "../../../../src/components/ObsDetails/hooks/fetchObsFromRealm", ( ) => ( {
  useFetchObsDetailsFromRealm: ( ) => {
    return mockExpected;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        uuid: mockExpected.uuid
      }
    } )
  };
} );

const renderObsDetails = ( ) => render(
  <NavigationContainer>
    <ObsDetails />
  </NavigationContainer>
);

test( "renders obs details from local Realm", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );

  expect( getByTestId( `ObsDetails.${testObservation.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source ).toStrictEqual( { "uri": testObservation.observationPhotos[0].photo.url } );
  expect( getByText( testObservation.taxon.preferredCommonName ) ).toBeTruthy( );
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy( );
} );


test( "renders data tab on button press", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );
  const button = getByTestId( "ObsDetails.DataTab" );

  fireEvent.press( button );
  const time = testObservation.timeObservedAt;
  // need regex here because the time observed is only a substring within <Text>
  const regex =  new RegExp( time );
  expect( getByText( regex ) ).toBeTruthy( );
} );
