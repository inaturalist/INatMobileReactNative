import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  ActivityIndicator,
  Body1,
  Body2,
  Button,
  CustomFlashList,
  Heading1,
  INatIcon,
  InfiniteScrollLoadingWheel,
  ProjectListItem,
  SearchBar,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { Tab } from "components/SharedComponents/Tabs/Tabs.tsx";
import { Pressable, View } from "components/styledComponents";
import React, { useCallback, useEffect } from "react";
import {
  useTranslation
} from "sharedHooks";

import FlashListEmptyWrapper from "../SharedComponents/FlashList/FlashListEmptyWrapper";
import { TAB_ID } from "./ProjectsContainer";

// const HEADER_HEIGHT = 177;
// const FOOTER_HEIGHT = 77;
// const HALF_GRADIENT_AND_TEXT_HEIGHT = 216 / 2;

interface Props {
  currentTabId: TAB_ID;
  fetchNextPage: ( ) => void;
  hasPermissions: boolean | undefined;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  memberId?: number;
  projects: Object[],
  requestPermissions: () => void;
  searchInput: string;
  setSearchInput: ( _text: string ) => void;
  tabs: Tab[],
}

const Projects = ( {
  currentTabId,
  fetchNextPage,
  hasPermissions,
  isFetchingNextPage,
  isLoading,
  memberId,
  projects,
  requestPermissions,
  searchInput,
  setSearchInput,
  tabs
}: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );

  const hideLoadingWheel = !isFetchingNextPage || projects?.length === 0;

  useEffect( ( ) => {
    const headerLeft = ( ) => (
      <>
        <INatIcon
          name="briefcase"
          size={25}
        />
        <Heading1 className="pl-2 pt-1">{t( "Projects" )}</Heading1>
      </>
    );

    navigation.setOptions( {
      headerLeft
    } );
  }, [navigation, t] );

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={hideLoadingWheel}
      isConnected={isConnected}
    />
  ), [hideLoadingWheel, isConnected] );

  const renderProject = ( { item: project } ) => (
    <Pressable
      className="px-4 py-1.5"
      onPress={( ) => navigation.navigate( "ProjectDetails", { id: project.id } )}
      testID={`Project.${project.id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "Navigates-to-project-details" )}
    >
      <ProjectListItem item={project} />
    </Pressable>
  );

  const renderEmptyList = ( ) => {
    if ( isLoading ) {
      <ActivityIndicator size={50} />;
    } else {
      return (
        <FlashListEmptyWrapper
          headerHeight={182}
          emptyItemHeight={90}
        >
          <Body1 className="self-center">{t( "No-projects-match-that-search" )}</Body1>
          <View className="w-full px-4 mt-5">
            <Button
              level="neutral"
              text={t( "RESET-SEARCH" )}
              onPress={( ) => setSearchInput( "" )}
            />
          </View>
        </FlashListEmptyWrapper>
      );
    }

    if ( searchInput.length === 0 ) {
      if ( currentTabId === TAB_ID.JOINED && !memberId ) {
        return (
          <View className="items-center">
            <Body1>{t( "You-havent-joined-any-projects-yet" )}</Body1>
            <Body1 className="mt-5">{t( "You-can-click-join-on-the-project-page" )}</Body1>
          </View>
        );
      }
    }

    return null;
  };

  const renderList = ( ) => {
    // hasPermission undefined means we haven't checked for location permissions yet
    // false means the user has denied or not yet given location permissions
    if ( currentTabId === TAB_ID.NEARBY && hasPermissions === false ) {
      return (
        <View className="flex-1 justify-center p-4">
          <View className="items-center">
            <Body2>{t( "To-view-nearby-projects-please-enable-location" )}</Body2>
          </View>
          <Button
            className="mt-5"
            text={t( "ALLOW-LOCATION-ACCESS" )}
            accessibilityHint={t( "Opens-location-permission-prompt" )}
            level="focus"
            onPress={( ) => requestPermissions()}
          />
        </View>
      );
    }
    return (
      <CustomFlashList
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        data={projects}
        estimatedItemSize={100}
        onEndReached={fetchNextPage}
        renderItem={renderProject}
        testID="Project.list"
      />
    );
  };

  return (
    <ViewWrapper testID="Projects">
      <View className="py-5 mx-4">
        <SearchBar
          autoFocus={false}
          handleTextChange={setSearchInput}
          value={searchInput}
          testID="ProjectSearch.input"
          placeholder={t( "Search-for-a-project" )}
          clearSearch={( ) => setSearchInput( "" )}
        />
      </View>
      {searchInput.length === 0 && (
        <>
          <Tabs tabs={tabs} activeId={currentTabId} />
          <View className="mb-3" />
        </>
      )}
      {renderList( )}
    </ViewWrapper>
  );
};

export default Projects;
