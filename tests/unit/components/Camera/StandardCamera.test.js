import { fireEvent, render, screen } from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera";
import { ObsEditContext } from "providers/contexts";
import React from "react";

const mockedNavigate = jest.fn();

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate
    } ),
    useRoute: () => ( {} )
  };
} );

const mockValue = {
  addCameraPhotosToCurrentObservation: jest.fn(),
  allObsPhotoUris: [],
  cameraPreviewUris: []
};

const renderStandardCamera = () => render(
  <ObsEditContext.Provider value={mockValue}>
    <StandardCamera />
  </ObsEditContext.Provider>
);

describe( "StandardCamera", ( ) => {
  test( "should first render with flash disabled", async () => {
  } );

  test( "should change to flash enabled on button press", async () => {
    renderStandardCamera();

    const flashButton = await screen.findByLabelText(
      "The flash is turned off. Press here to enable it."
    );
    fireEvent.press( flashButton );

    await screen.findByLabelText(
