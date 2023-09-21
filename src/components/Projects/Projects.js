// @flow

import { useNavigation } from "@react-navigation/native";
import displayProjectType from "components/Projects/helpers/displayProjectType";
import {
  Body1, Button,
  Heading1, INatIcon,
  List2,
  SearchBar, Tabs, ViewWrapper
} from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import {
  FlatList
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  useTranslation
} from "sharedHooks";
import { viewStyles } from "styles/projects/projects";

type Props = {
  searchInput: string,
  setSearchInput: Function,
  tabs: Array<Object>,
  currentTabId: string,
  projects: Array<Object>,
  isLoading: boolean,
  memberId: ?number
}

const Projects = ( {
  searchInput, setSearchInput, tabs, currentTabId, projects, isLoading, memberId
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

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

  const renderProject = ( { item: project } ) => (
    <Pressable
      onPress={( ) => navigation.navigate( "ProjectDetails", { id: project.id } )}
      style={viewStyles.row}
      testID={`Project.${project.id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "Navigate-to-project-details" )}
    >
      <Image
        className="w-[62px] h-[62px] rounded-xl ml-4 mr-3"
        source={{ uri: project.icon }}
        testID={`Project.${project.id}.photo`}
        accessibilityIgnoresInvertColors
      />
      <View className="shrink mr-4">
        <Body1>{project.title}</Body1>
        <List2 className="mt-2">{displayProjectType( project.project_type, t )}</List2>
      </View>
    </Pressable>
  );

  const renderEmptyList = ( ) => {
    if ( isLoading ) {
      <ActivityIndicator large />;
    } else {
      return (
        <>
          <Body1 className="self-center">{t( "No-projects-match-that-search" )}</Body1>
          <View className="w-full px-4 mt-5">
            <Button
              level="neutral"
              text={t( "RESET-SEARCH" )}
              onPress={( ) => setSearchInput( "" )}
            />
          </View>
        </>
      );
    }

    if ( searchInput.length === 0 ) {
      if ( currentTabId === "JOINED" && !memberId ) {
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

  const emptyListStyles = {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  };

  return (
    <ViewWrapper testID="Projects">
      <SearchBar
        handleTextChange={setSearchInput}
        value={searchInput}
        testID="ProjectSearch.input"
        containerClass="pb-5 mx-4"
        placeholder={t( "Search-for-a-project" )}
        clearSearch={( ) => setSearchInput( "" )}
      />
      {searchInput.length === 0 && (
        <>
          <Tabs tabs={tabs} activeId={currentTabId} />
          <View className="mb-3" />
        </>
      )}
      <FlatList
        contentContainerStyle={projects?.length === 0 && emptyListStyles}
        data={projects}
        renderItem={renderProject}
        testID="Project.list"
        ListEmptyComponent={renderEmptyList}
      />
    </ViewWrapper>
  );
};

export default Projects;
