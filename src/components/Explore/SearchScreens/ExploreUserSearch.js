// @flow

import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

const ExploreUserSearch = ( ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const navigation = useNavigation( );
  const { t } = useTranslation();

  // TODO: replace this with infinite scroll like ExploreFlashList
  const { data: userList } = useAuthenticatedQuery(
    ["fetchSearchResults", userQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: userQuery,
        sources: "users",
        fields: "user.id,user.login,user.icon_url,user.observations_count"
      },
      optsWithAuth
    )
  );

  const onUserSelected = useCallback( async user => {
    if ( !user.id && !user.login ) {
      // If both of those are missing, we can not query by user
      // TODO: user facing error message
      return;
    }
    navigation.navigate( "Explore", { user } );
  }, [navigation] );

  const renderItem = useCallback(
    ( { item } ) => (
      <UserListItem
        item={{ user: item }}
        countText="X-Observations"
        accessibilityLabel={t( "Select-user" )}
        onPress={( ) => onUserSelected( item )}
      />
    ),
    [onUserSelected, t]
  );

  // TODO: pagination like in ExploreFlashList ?

  const renderItemSeparator = () => (
    <View className="border-b border-lightGray" />
  );

  return (
    <ViewWrapper className="flex-1">
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
      </View>
      <FlashList
        data={userList}
        initialNumToRender={5}
        estimatedItemSize={100}
        testID="SearchUserList"
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderItemSeparator}
        ItemSeparatorComponent={renderItemSeparator}
        accessible
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
