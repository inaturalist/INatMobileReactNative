import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";
import Config from "react-native-config-node";

describe( "Sign into app as logged-in user", () => {
  beforeAll( async () => {
    await device.launchApp( {
      newInstance: true,
      permissions: { location: "always" }
    } );
  } );

  beforeEach( async () => {
    // device.launchApp would be preferred for an app of our complexity. It does work locally
    // for both, but on CI for Android it does not work. So we use reloadReactNative for Android.
    if ( device.getPlatform() === "android" ) {
      await device.reloadReactNative();
    } else {
      await device.launchApp( {
        newInstance: true,
        permissions: { location: "always" }
      } );
    }
  } );

  it( "should open app with the observation list screen", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    // 10000 timeout is for github actions, which was failing with a
    // shorter timeout period
    await waitFor( loginText ).toBeVisible().withTimeout( 10000 );
    await expect( loginText ).toBeVisible();
    await element( by.id( "log-in-to-iNaturalist-button.text" ) ).tap();
    const usernameInput = element( by.id( "Login.email" ) );
    await waitFor( usernameInput ).toBeVisible().withTimeout( 10000 );
    await expect( usernameInput ).toBeVisible();
    await element( by.id( "Login.email" ) ).tap();
    await element( by.id( "Login.email" ) ).typeText( Config.E2E_TEST_USERNAME );
    const passwordInput = element( by.id( "Login.password" ) );
    await expect( passwordInput ).toBeVisible();
    await element( by.id( "Login.password" ) ).tap();
    await element( by.id( "Login.password" ) ).typeText( Config.E2E_TEST_PASSWORD );
    const loginButton = element( by.id( "Login.loginButton" ) );
    await expect( loginButton ).toBeVisible();
    await element( by.id( "Login.loginButton" ) ).tap();
    const username = element( by.text( `@${Config.E2E_TEST_USERNAME}` ) ).atIndex( 1 );
    await waitFor( username ).toBeVisible().withTimeout( 10000 );
    await expect( username ).toBeVisible();
  } );
} );
