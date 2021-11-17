import "react-native-gesture-handler/jestSetup";

// this resolves error with importing file after Jest environment is torn down
// https://github.com/react-navigation/react-navigation/issues/9568#issuecomment-881943770
jest.mock( "@react-navigation/native/lib/commonjs/useLinking.native", ( ) => ( {
  default: ( ) => ( {getInitialState: {then: jest.fn()}} ),
  __esModule: true
} ) );

// https://github.com/callstack/react-native-testing-library/issues/658#issuecomment-766886514
jest.mock( "react-native/Libraries/LogBox/LogBox" );

// Mock the realm config so it uses an in-memory database
jest.mock( "../src/models/index", ( ) => {
  const originalModule = jest.requireActual( "../src/models/index" );

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: {
      schema: originalModule.default.schema,
      schemaVersion: originalModule.default.schemaVersion,
      inMemory: true
    }
  };
} );

// Some test environments may need a little more time
jest.setTimeout( 30000 );
