/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 * with added config for react-native-svg-transformer
 * https://www.npmjs.com/package/react-native-svg-transformer?activeTab
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require( "@react-native/metro-config" );

const {
  resolver: { sourceExts, assetExts }
} = getDefaultConfig();

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve( "react-native-svg-transformer" )
  },
  resolver: {
    assetExts: assetExts.filter( ext => ext !== "svg" ),
    sourceExts:
      process.env.MOCK_MODE === "e2e"
        ? ["e2e-mock", ...sourceExts, "svg"]
        : [...sourceExts, "svg"]
  }
};

module.exports = mergeConfig( getDefaultConfig( __dirname ), config );
