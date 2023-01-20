import { fireEvent, render, screen } from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera";
import { ObsEditContext } from "providers/contexts";
import React from "react";
import { View } from "react-native";

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

jest.mock( "react-native-orientation-locker", () => ( {
  addEventListener: jest.fn(),
  addDeviceOrientationListener: jest.fn(),
  removeEventListener: jest.fn(),
  lockToPortrait: jest.fn(),
  lockToLandscapeLeft: jest.fn(),
  lockToLandscapeRight: jest.fn(),
  unlockAllOrientations: jest.fn(),
  removeOrientationListener: jest.fn()
} ) );

const mockValue = {
  addCameraPhotosToCurrentObservation: jest.fn(),
  allObsPhotoUris: [],
  cameraPreviewUris: []
};

const mockView = <View />;
jest.mock( "components/Camera/CameraView", () => ( {
  __esModule: true,
  default: ( ) => mockView
} ) );

jest.mock( "components/Camera/FadeInOutView", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

jest.mock( "components/Camera/PhotoPreview", () => ( {
  __esModule: true,
  default: () => mockView
} ) );

const renderStandardCamera = () => render(
  <ObsEditContext.Provider value={mockValue}>
    <StandardCamera />
  </ObsEditContext.Provider>
);

describe( "StandardCamera", ( ) => {
  test( "should first render with flash disabled", async () => {
    renderStandardCamera();

    await screen.findByTestId( "flash-button-label-flash-off" );
  } );

  test( "should change to flash enabled on button press", async () => {
    renderStandardCamera();

    const flashButton = await screen.findByTestId(
      "flash-button-label-flash-off"
    );
    fireEvent.press( flashButton );

    await screen.findByTestId( "flash-button-label-flash" );
  } );
} );
