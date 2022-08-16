import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";

import PhotoGallery from "../../../../src/components/PhotoLibrary/PhotoGallery";
import { ObsEditContext } from "../../../../src/providers/contexts";
import PhotoGalleryProvider from "../../../../src/providers/PhotoGalleryProvider";
import factory from "../../../factory";

// this resolves a test failure with the Animated library:
// Animated: `useNativeDriver` is not supported because the native animated module is missing.
jest.useFakeTimers( );

const mockPhoto = factory( "DevicePhoto" );

jest.mock( "../../../../src/components/PhotoLibrary/hooks/usePhotos", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { photos: [mockPhoto] } )
} ) );

jest.mock( "../../../../src/components/PhotoLibrary/hooks/usePhotoAlbums", ( ) => ( {
  __esModule: true,
  default: ( ) => [{
    label: "camera roll",
    value: "All",
    key: "camera roll"
  }]
} ) );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

// const mockPhotoGalleryProviderWithPhotos = selectedPhotos =>
//   PhotoGalleryProvider.mockImplementation( ( { children }: Props ): Node => (
//     <PhotoGalleryContext.Provider value={{
//       selectedPhotos
//     }}>
//       {children}
//     </PhotoGalleryContext.Provider>
//   ) );

const fakeObs = {
  observations: [factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88
  } )],
  currentObsIndex: 0
};

const renderPhotoGallery = ( ) => render(
  <NavigationContainer>
    <PhotoGalleryProvider>
      <ObsEditContext.Provider value={fakeObs}>
        <PhotoGallery />
      </ObsEditContext.Provider>
    </PhotoGalleryProvider>
  </NavigationContainer>
);

test( "renders photos from photo gallery", ( ) => {
  const { getByTestId } = renderPhotoGallery( );

  // console.log( mockPhoto, "mock photo in test" );

  expect( getByTestId( "PhotoGallery.list" ) ).toBeTruthy( );
  expect( getByTestId( `PhotoGallery.${mockPhoto.uri}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoGallery.photo" ).props.source )
    .toStrictEqual( { uri: mockPhoto.uri } );
} );

// right now this is failing on react-native-modal, since there's a TouchableWithFeedback
// that allows the user to tap the backdrop and exit the modal
test.todo( "should not have accessibility errors" );

test.todo( "navigates to GroupPhotos when photo is selected" );
