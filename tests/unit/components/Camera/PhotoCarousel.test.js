import {
  fireEvent, render, screen, waitFor
} from "@testing-library/react-native";
import PhotoCarousel from "components/Camera/StandardCamera/PhotoCarousel";
import React from "react";
import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );

// For snapshots we want test data not to be random
const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/2/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/3/large.jpeg"
];

describe( "PhotoCarousel", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );
  // There were some tests of photo sizes responding to the isLargeScreen prop
  // but somewhat dynamic tailwind classes don't seem to create style props
  // in a test environment, so I'm not sure we can test those now ~~~kueda
  // 20230518
  it( "renders correctly", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "renders correctly for large screen", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "deletes a photo on long press", async ( ) => {
    const removePhotoFromList = ( list, photo ) => {
      const i = list.findIndex( p => p === photo );
      list.splice( i, 1 );
      return list || [];
    };

    useStore.setState( {
      evidenceToAdd: [mockPhotoUris[2]],
      cameraPreviewUris: mockPhotoUris,
      photoEvidenceUris: mockPhotoUris,
      deletePhotoFromObservation: uri => useStore.setState( {
        cameraPreviewUris: [...removePhotoFromList( mockPhotoUris, uri )]
      } )
    } );

    const { cameraPreviewUris } = useStore.getState( );

    render(
      <PhotoCarousel
        photoUris={cameraPreviewUris}
      />
    );
    const photoImage = screen.getByTestId( `PhotoCarousel.displayPhoto.${cameraPreviewUris[2]}` );
    fireEvent( photoImage, "onLongPress" );
    const deleteMode = screen.getByTestId( `PhotoCarousel.deletePhoto.${cameraPreviewUris[2]}` );
    await waitFor( ( ) => {
      expect( deleteMode ).toBeVisible( );
    } );
    fireEvent.press( deleteMode );

    render(
      <PhotoCarousel
        photoUris={cameraPreviewUris}
      />
    );

    const undeletedPhoto = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${cameraPreviewUris[1]}`
    );
    expect( undeletedPhoto ).toBeVisible( );
    const deletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${cameraPreviewUris[2]}`
    );
    await waitFor( ( ) => {
      expect( deletedPhoto ).toBeFalsy( );
    } );
  } );
} );
