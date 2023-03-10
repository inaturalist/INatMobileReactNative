# iNaturalistReactNative

This is an official iNaturalist client written in React Native that will eventually replace our existing iOS and Android apps. Achieving parity with those established apps is taking some time, but we're getting there!

## Contributing

We welcome volunteer contributions! This app is still early in its development and a lot of things are in flux, but there's usually something to work on. Please keep the following in mind:

1. Work on [existing issues](https://github.com/inaturalist/iNaturalistReactNative/issues) (though if you have ideas for improvement that aren't directly related to features, let us know). If you'd like to work on something, please leave a comment on that issue and we'll try and assign you.
1. Name your branch starting with the issue number and then something descriptive, e.g. `123-login-with-locale-crash`
1. We try to review pull requests as soon as we can, but that might be up to a week or two

## Setup

### Requirements

* Xcode 13 or above
* [Android and iOS environment setup](https://reactnative.dev/docs/environment-setup) described in the RN docs

### Install packages and pods

1. Run `npm install`
1. Run `npx pod-install` or `cd ios && pod install` from the root directory
1. `cp env.example .env.staging` for staging and `cp env.example .env` for production and fill in appropriate values. This is not part of the code repo (contains secrets, such as OAuth client ID).
1. To run on Android, do this `cp android/example-keystore.properties android/keystore.properties`. Fill in the relevant values. If you are a member of iNat staff, get them from another member of iNat Staff. 

### Set up pre-commit hooks

1. We're using [Husky](https://typicode.github.io/husky/#/) to automatically run `eslint` before each commit. Run `npm run postinstall` to install Husky locally.

### Run build

1. Run `npm start -- --reset-cache` (`npm start` works too, but resetting the cache each time makes for a lot less build issues)
2. Run `npm run ios` or `npm run android`

### Running with staging environment

If you're on staff you can configure the app to read from and write to our staging server. Override `API_URL` to a staging API domain, either using local `.env.staging` file, or overriding the environment variable when calling `npm start`, e.g. `API_URL=http://example.com npm start -- --reset-cache`.

## Tests
We currently have three kinds of tests:

1. `tests/integration`: Tests the integration of multiple modules, e.g. a list of observation that makes requests to a mocked API, persists the response data in local storage, retrieves the data from local storage and renders components.
2. `tests/unit`: Tests only specific modules, like a single component, or a hook.
3. `e2e`: Tests user interactions on the finished app build running on the iOS simulator (see below).

### Unit tests & integration tests
We're using [Jest](https://jestjs.io/) and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for most of our tests, [factoria](https://github.com/phanan/factoria) and [faker.js](https://github.com/Marak/faker.js/) to generate test data for use with mocks. `Local*` model factories represent locally persisted data, while `Remote*` factories represent that kinds of records we get from an API or external package.

```bash
# Run all tests
npm test

# Run test paths matching a pattern
npm test MyObs

# Run individual tests matching a pattern. Note the `--` to pass arguments to jest
npm test -- -t accessibility
```

Note that you can run `npx jest` as well, but that will omit some environment variables we need to set for the test environment, so for consistent test runs please use `npm test`.

Also note that `i18next` needs to be initialized in individual test files (haven't figured out a way to await initialization before *all* tests, plus allowing tests to control initialization helps when testing different locales). Add `beforeAll( async ( ) => { await initI18next( ); } );` to a test file if it depends on localized text.

### E2E tests
We're using [Detox](https://wix.github.io/Detox/docs/19.x/) for E2E tests. If you want to run the e2e tests on your local machine, make sure you fulfill the RN development requirements, see above, and also follow the iOS specific [environment setup](https://wix.github.io/Detox/docs/19.x/introduction/ios-dev-env/).

Then you have to populate `E2E_TEST_USERNAME` and `E2E_TEST_PASSWORD` in `.env` with real iNaturalist login credentials so the e2e test can actually authenticate.

Then you can run the tests:

```bash
# Build the app and run the tests
npm run e2e
```

If you have built the app already for a previous test, and just want to run an updated test without changing the app code, you can run `npm run e2e:test`.

If you are running into some issues after the tests have been working for some time, try updating `applesimutils` with `brew update && brew upgrade applesimutils`.

If you want to run the Android tests you need to prepare your environment. Before you dive into the [setup](https://wix.github.io/Detox/docs/19.x/introduction/android-dev-env), know that alternatively you might find it easier setting up the required local emulator, preferrably an AOSP (Android Open Source Project) version, using Android Studio. Make sure the emulator has the same name as in the .detoxrc.js file.
Run `npm run e2e:build:android && npm run e2e:test:android` to build the .apk for testing purposes and install and run it on the emulator with the name as stated in the detoxrc.js file.

## Translations

### Adding new text

1. Add new strings in English to `src/i18n/strings.ftl` using [Fluent syntax](https://projectfluent.org/fluent/guide/), e.g.
    ```Fluent
    # Header for a paragraph describing projects
    ABOUT-PROJECTS = ABOUT
    # Text describing what projects are
    projects-description =
      Projects are really great, probably iNat's best feature.
    ```
    Try to match case and strike a balance between specificity and reusability when choosing a key. Please add context comments to help translators understand how the text is used, avoid variables whenever possible, and try to keep `strings.ftl` alphabetized by key.
1. Run `node src/i18n/i18ncli.js build` to build the JSON files i18next needs to access text in the app
1. In a commponent, use the `useTranslation` hook to reference your new string, e.g.
    ```jsx
    import { useTranslation } from "react-i18next";
    const MyComponent = ( ) => {
      const { t } = useTranslation();
      return (
        <View>
          <Text>{ t( "ABOUT-PROJECTS" ) }</Text>
          <Text>{ t( "projects-description" ) }</Text>
        </View>
      );
    };
    ````

### Translating text

We manage translations through Crowdin. Actually updating the translation files should be largely automated, but this is what it looks like to do it manually (you must have the [Crowdin CLI](https://github.com/crowdin/crowdin-cli) installed and have an [access token](https://crowdin.com/settings#api-key) associated with a Crowdin user that can post files to the specified project):

```bash
# Upload new strings. Source and destination paths are specified in crowdin.yml
crowdin upload --token YOUR_ACCESS_TOKEN --project-id YOUR_PROJECT_ID

# Download new translations and build for use in the app
crowdin download --token YOUR_ACCESS_TOKEN --project-id YOUR_PROJECT_ID
node src/i18n/i18ncli.js build
git add src/i18n/l10n/*
git commit -a -m "Updated translations"
```

## Styling
We're using Nativewind, a styling system for React Native based on Tailwind CSS. Check the [Nativewind documentation](https://www.nativewind.dev/) to see what styles can be used in RN.

## Creating custom icons

We manage our custom font with Fontastic, so these steps can probably only be done by staff.

1. `npm install -f react-native-asset`. You'll need this to link assets.
1. Get the new icon as an SVG file. Make sure the file name matches the icon name and no prefixes like `icon-` or `icn-`. If the icon is called "shield" the file name should be `shield.svg`.
1. Add new icon to the iNaturalist icon set in Fontastic. **Don't change any of the existing names** and **don't change any of the existing selections** (this could mess with other projects using the font). Just add your new icon(s) to the selection.
1. Click the "Publish" tab and click the "DOWNLOAD" button to download the zip of the font. Unzip it.
1. Create a glyph file from the CSS file in the zip you just downloaded, using the following command (be sure to replace /path/to/styles with your path):
    ```
    npx generate-icon /path/to/styles.css --componentName=INatIcon --fontFamily=inaturalisticons > src/components/SharedComponents/INatIcon/INatIcon.js
    ```
1. When adding new icons, go to `src/components/SharedComponents/INatIcon/INatIcon.js` and make two manual changes:
    1. First, edit the line `const iconSet = createIconSet( glyphMap, "inaturalisticons", "INatIcon.ttf" );` to `inaturalisticons.ttf` to match the name of the `.ttf` file you downloaded. There's a discrepency here because the `generate-icon` script makes an assumption that the name of the .ttf file is the same as the name of the component. Components need to start with a capital letter, and `inaturalisticons.tff` is likely not a name we want to change, since we're using it on the web too. We'll probably want to write our own `generate-icon` script to do this automatically.
    1. Second, add the following to your exports to make sure a user can see all custom iNat icons in the UI library:
        ```
        export {
          glyphMap
        };
        ```
1. Add `inaturalisticons.ttf`, to `assets/fonts`.
1. Clean build folders for iOS/Android with `rm -rf ios/build && rm -rf android/app/build`.
1. Run `npx react-native-asset` to link the new assets.
1. Add your icon somewhere in the app using `<INatIcon name="compass-rose" />` where name is set to the name of your new custom icon.
1. Build the app on either platform, and you should see your custom icons.

If anything goes wrong, check the [troubleshooting steps](https://github.com/oblador/react-native-vector-icons#troubleshooting) from `react-native-vector-icons` instructions on creating a glyph map.

## Troubleshooting

1. Run `npx react-native clean-project`. This will give you options to clean caches, clean builds, reinstall pods, and reinstall node_modules. Using this eliminates a lot of hard-to-diagnose build issues.
1. If you're running on an M series chip, you may need to install a specific version of NDK to the app to build for Android. See `android/build.gradle`


## Deploying

We use [fastlane](https://docs.fastlane.tools/) to help automate parts of the deployment process, which requires some additional setup.

### Setting up fastlane

1. Make a [Github personal access token](https://github.com/settings/tokens/) with repo access in the `GITHUB_API_TOKEN` environmental variable.
1. `cp android/example-keystore.properties android/keystore.properties` and fill in the relevant values provided by another member of iNat staff.
1. `cp fastlane/example-Appfile fastlane/Appfile` and fill in the relevant values provided by another member of iNat staff.
1. Work with iNat staff to either get a new Apple ID or associate an existing one with the iNat Apple development team
1. Sign in to Xcode with your Apple ID
1. Manage Certificates and add an Apple Distribution certificate associated with the iNaturalist team


### Usage

The current expectation is that you we tag to freeze the code, bump the version, and describe the changes represented by the tag. Then we release to make builds and publish on Github. Later, presumably when some of the change logs have been translated, we push builds for internal testing. If that looks ok, we push to public testing, and later to production release.

```zsh
# Make a git tag. This will bump the build number and prompt you to describe
# what changed, which will be used for the eventual github release
# description and changelogs uploaded to the app stores.
fastlane tag

# Make a github release. This will make relevant builds, a github release, and
# add build files to the release
fastlane release

# Upload the build for the latest tag for internal testing
fastlane internal

# Upload the build for the latest tag for public testing (promotes latest
# internal build to open testing)
fastlane beta

# Upload the build for the latest tag to production release. In Android, this
# should just promote the last beta to prod.
fastlane prod
```
