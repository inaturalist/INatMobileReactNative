import "react-native-gesture-handler/jestSetup";
import "@shopify/flash-list/jestSetup";

import mockBottomSheet from "@gorhom/bottom-sheet/mock";
import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock";
import mockRNCNetInfo from "@react-native-community/netinfo/jest/netinfo-mock";
import mockFs from "fs";
import inatjs from "inaturalistjs";
import fetchMock from "jest-fetch-mock";
import React from "react";
import mockBackHandler from "react-native/Libraries/Utilities/__mocks__/BackHandler";
import mockRNDeviceInfo from "react-native-device-info/jest/react-native-device-info-mock";
// eslint-disable-next-line import/no-unresolved
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
import MockAudioRecorderPlayer from "tests/mocks/react-native-audio-recorder-player";
import * as mockPhotoImporter from "tests/mocks/react-native-image-picker";
import * as mockRNLocalize from "tests/mocks/react-native-localize.ts";
import * as mockZustand from "tests/mocks/zustand.ts";

import factory, { makeResponse } from "./factory";

// Mock the react-native-logs config because it has a dependency on AuthenticationService
// instead use console.logs for tests
jest.mock( "../react-native-logs.config", () => {
  const log = {
    extend: jest.fn( () => ( {
      debug: msg => console.debug( msg ),
      info: msg => console.info( msg ),
      warn: msg => console.warn( msg ),
      error: msg => console.error( msg )
    } ) )
  };
  return {
    log,
    logFilePath: "inaturalist-rn-log.txt"
  };
} );

jest.mock( "vision-camera-plugin-inatvision", () => ( {
  getPredictionsForImage: jest.fn( () => Promise.resolve( { predictions: [] } ) ),
  removeLogListener: jest.fn( ),
  resetStoredResults: jest.fn( )
} ) );

jest.mock( "@sayem314/react-native-keep-awake" );
jest.mock( "react-native/Libraries/EventEmitter/NativeEventEmitter" );

require( "react-native-reanimated" ).setUpTests();

jest.mock( "react-native-localize", () => mockRNLocalize );
jest.mock( "react-native-safe-area-context", () => mockSafeAreaContext );

// mock Portal with a Modal component inside of it (MediaViewer)
jest.mock( "react-native-paper", () => {
  const actual = jest.requireActual( "react-native-paper" );
  const MockedModule = {
    ...actual,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    Portal: ( { children } ) => <>{children}</>
  };
  return MockedModule;
} );

// 20240806 amanda - best practice for react navigation
// is actually not to mock navigation at all. I removed
// useFocusEffect so we can test how that actually works in
// components; it requires using the wrapInNavigationContainer
// helper around components with useFocusEffect
// https://reactnavigation.org/docs/testing/#best-practices
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ( ) => ( { params: {} } ) ),
    useNavigation: ( ) => ( {
      addListener: jest.fn(),
      canGoBack: jest.fn( ( ) => true ),
      goBack: jest.fn( ),
      setOptions: jest.fn( )
    } )
  };
} );

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( { getInitialState: { then: jest.fn( ) } } ),
  __esModule: true
} ) );

// https://github.com/callstack/react-native-testing-library/issues/658#issuecomment-766886514
jest.mock( "react-native/Libraries/LogBox/LogBox" );

jest.mock( "react-native-device-info", () => mockRNDeviceInfo );

jest.mock( "react-native-sensitive-info", () => {
  class RNSInfo {
    static stores = new Map();

    static getServiceName( o = {} ) {
      return o.sharedPreferencesName
        || o.keychainService
        || "default";
    }

    static validateString( s ) {
      if ( typeof s !== "string" ) { throw new Error( "Invalid string:", s ); }
    }

    static getItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) { return service.get( k ) || null; }
      return null;
    } );

    static getAllItems = jest.fn( async o => {
      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );
      let mappedValues = [];

      if ( service?.size ) {
        // for ( const [k, v] of service.entries() ) {
        //   mappedValues.push( { key: k, value: v, service: serviceName } );
        // }
        mappedValues = service.entries( ).map(
          ( key, value ) => ( { key, value, service: serviceName } )
        );
      }

      return mappedValues;
    } );

    static setItem = jest.fn( async ( k, v, o ) => {
      RNSInfo.validateString( k );
      RNSInfo.validateString( v );

      const serviceName = RNSInfo.getServiceName( o );
      let service = RNSInfo.stores.get( serviceName );

      if ( !service ) {
        RNSInfo.stores.set( serviceName, new Map() );
        service = RNSInfo.stores.get( serviceName );
      }

      service.set( k, v );

      return null;
    } );

    static deleteItem = jest.fn( async ( k, o ) => {
      RNSInfo.validateString( k );

      const serviceName = RNSInfo.getServiceName( o );
      const service = RNSInfo.stores.get( serviceName );

      if ( service ) { service.delete( k ); }

      return null;
    } );

    static hasEnrolledFingerprints = jest.fn( async () => true );

    static setInvalidatedByBiometricEnrollment = jest.fn();

    // "Touch ID" | "Face ID" | false
    static isSensorAvailable = jest.fn( async () => "Face ID" );
  }

  return RNSInfo;
} );

// Some test environments may need a little more time
jest.setTimeout( 50000 );

// https://github.com/zoontek/react-native-permissions
// eslint-disable-next-line global-require
jest.mock( "react-native-permissions", () => require( "react-native-permissions/mock" ) );

require( "react-native" ).NativeModules.RNCGeolocation = { };

jest.mock( "@react-native-community/netinfo", () => mockRNCNetInfo );

global.ReanimatedDataMock = {
  now: () => 0
};

jest.mock( "react-native-fs", ( ) => {
  const RNFS = {
    appendFile: jest.fn( ),
    CachesDirectoryPath: "caches/directory/path",
    DocumentDirectoryPath: "document/directory/path",
    exists: jest.fn( async ( ) => true ),
    moveFile: async ( ) => "testdata",
    copyFile: async ( ) => "testdata",
    stat: jest.fn( ( ) => ( {
      mtime: new Date()
    } ) ),
    readFile: jest.fn( ( ) => "testdata" ),
    readDir: jest.fn( async ( ) => ( [
      {
        ctime: new Date(),
        mtime: new Date(),
        name: "testdata"
      }
    ] ) ),
    writeFile: jest.fn( async ( filePath, contents, _encoding ) => {
      mockFs.writeFile( filePath, contents, jest.fn( ) );
    } ),
    mkdir: jest.fn( async ( filepath, _options ) => {
      mockFs.mkdir( filepath, jest.fn( ) );
    } ),
    unlink: jest.fn( async ( path = "" ) => {
      if ( !path ) return;
      if ( typeof ( path ) !== "string" ) return;
      mockFs.unlink( path, jest.fn( ) );
    } )
  };

  return RNFS;
} );

require( "react-native" ).NativeModules.FileReaderModule = { };

// Mock native animation for all tests
jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );

jest.mock( "@gorhom/bottom-sheet", ( ) => ( {
  ...mockBottomSheet,
  __esModule: true,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  BottomSheetTextInput: ( ) => <></>
} ) );

// https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/493#issuecomment-861711442
jest.mock( "react-native-keyboard-aware-scroll-view", ( ) => ( {
  KeyboardAwareScrollView: jest
    .fn( )
    .mockImplementation( ( { children } ) => children )
} ) );

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
inatjs.observations.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

const mockErrorHandler = error => {
  console.log( error );
};
jest.mock( "react-native-exception-handler", () => ( {
  setJSExceptionHandler: jest
    .fn()
    .mockImplementation( () => mockErrorHandler() ),
  setNativeExceptionHandler: jest
    .fn()
    .mockImplementation( () => mockErrorHandler() )
} ) );

// Set up mocked fetch for testing (or disabling) fetch requests
fetchMock.enableMocks( );
fetchMock.dontMock( );

const mockIconicTaxon = factory( "RemoteTaxon", {
  is_iconic: true,
  name: "Mock iconic taxon"
} );
inatjs.taxa.search.mockResolvedValue( makeResponse( [mockIconicTaxon] ) );

jest.mock( "jsrsasign" );

inatjs.announcements.search.mockResolvedValue( makeResponse( ) );
inatjs.observations.updates.mockResolvedValue( makeResponse( ) );

jest.mock( "react-native-audio-recorder-player", ( ) => MockAudioRecorderPlayer );

jest.mock( "@react-native-clipboard/clipboard", () => mockClipboard );

jest.mock( "react-native-webview", () => {
  const MockWebView = jest.requireActual( "react-native" ).View;

  return {
    __esModule: true,
    WebView: MockWebView,
    default: MockWebView
  };
} );

jest.mock( "react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const turboModuleRegistry = jest
    .requireActual( "react-native/Libraries/TurboModule/TurboModuleRegistry" );
  return {
    ...turboModuleRegistry,
    getEnforcing: name => {
      // List of TurboModules libraries to mock.
      const modulesToMock = ["ReactNativeKCKeepAwake"];
      if ( modulesToMock.includes( name ) ) {
        return null;
      }
      return turboModuleRegistry.getEnforcing( name );
    }
  };
} );

// Mock zustand in a way that will allow us to reset its state between tests
jest.mock( "zustand", ( ) => mockZustand );
// afterEach( () => {
//   act( () => {
//     mockZustand.storeResetFns.forEach( resetFn => {
//       resetFn();
//     } );
//   } );
// } );

jest.mock( "react-native-image-picker", ( ) => mockPhotoImporter );

jest.mock(
  "react-native/Libraries/Utilities/BackHandler",
  () => mockBackHandler
);
