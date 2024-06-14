import Toolbar from "components/MyObservations/Toolbar";
import {
  Heading1
} from "components/SharedComponents";
import {
  ScrollView
} from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const ToolbarDemo = ( ) => {
  const theme = useTheme( );
  return (
    <ScrollView>
      <Heading1>Basic</Heading1>
      <Toolbar
        error=""
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={0}
        statusText=""
        stopAllUploads={noop}
        syncIconColor="black"
        toggleLayout={noop}
      />
      <Heading1>Needs Upload</Heading1>
      <Toolbar
        error=""
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={0}
        showsExclamation
        showsExploreIcon
        statusText="Upload 3 observations"
        stopAllUploads={noop}
        syncIconColor={theme.colors.secondary}
        toggleLayout={noop}
      />
      <Heading1>Uploading</Heading1>
      <Toolbar
        error=""
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={0.2}
        rotating
        showsCancelUploadButton
        showsExploreIcon
        statusText="doing some uploading"
        stopAllUploads={noop}
        syncIconColor={theme.colors.secondary}
        toggleLayout={noop}
      />
      <Heading1>Uploading w/error</Heading1>
      <Toolbar
        error="something went terribly wrong"
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={0.5}
        rotating
        showsCancelUploadButton
        showsExploreIcon
        statusText="doing some uploading"
        stopAllUploads={noop}
        syncIconColor={theme.colors.secondary}
        toggleLayout={noop}
      />
      <Heading1>Uploading w/ long status</Heading1>
      <Toolbar
        error=""
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={0.2}
        rotating
        showsCancelUploadButton
        showsExploreIcon
        statusText="doing some uploading that will be really great i promise"
        stopAllUploads={noop}
        syncIconColor={theme.colors.secondary}
        toggleLayout={noop}
      />
      <Heading1>Finished w/error</Heading1>
      <Toolbar
        error="something went terribly wrong"
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={1}
        showsExploreIcon
        showsExclamation
        showsCheckmark
        statusText="3 observations uploaded"
        stopAllUploads={noop}
        syncIconColor={theme.colors.error}
        toggleLayout={noop}
      />
      <Heading1>Error w/o status</Heading1>
      <Toolbar
        error="something went terribly, terribly, terribly wrong"
        handleSyncButtonPress={noop}
        layout="grid"
        navToExplore={noop}
        progress={1}
        showsExploreIcon
        showsExclamation
        showsCheckmark
        statusText=""
        stopAllUploads={noop}
        syncIconColor={theme.colors.error}
        toggleLayout={noop}
      />
    </ScrollView>
  );
};

export default ToolbarDemo;
