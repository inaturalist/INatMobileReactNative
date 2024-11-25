// @flow

import fetchSearchResults from "api/search";
import {
  Button,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import UserList from "components/UserList/UserList.tsx";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { useAuthenticatedQuery, useCurrentUser, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import EmptySearchResults from "./EmptySearchResults";
import ExploreSearchHeader from "./ExploreSearchHeader";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  updateUser: Function
};

const ExploreUserSearch = ( { closeModal, updateUser }: Props ): Node => {
  const [userQuery, setUserQuery] = useState( "" );
  const { t } = useTranslation();
  const currentUser = useCurrentUser();

  // TODO: replace this with infinite scroll like ExploreFlashList
  const { data: userList, isLoading, refetch } = useAuthenticatedQuery(
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
    updateUser( user );
    closeModal();
  }, [updateUser, closeModal] );

  const resetUser = useCallback(
    ( ) => {
      updateUser( null );
      closeModal();
    },
    [updateUser, closeModal]
  );

  // TODO: pagination like in ExploreFlashList ?

  const renderEmptyList = ( ) => (
    <EmptySearchResults
      isLoading={isLoading}
      searchQuery={userQuery}
      refetch={refetch}
    />
  );

  return (
    <ViewWrapper>
      <ExploreSearchHeader
        closeModal={closeModal}
        headerText={t( "SEARCH-USERS" )}
        resetFilters={resetUser}
        testID="ExploreUserSearch.close"
      />
      <View
        className="bg-white px-6 pt-2 pb-5"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setUserQuery}
          value={userQuery}
          testID="SearchUser"
        />
        <Button
          text={t( "MY-OBSERVATIONS" )}
          className="mt-5"
          onPress={() => {
            if ( currentUser ) {
              onUserSelected( currentUser );
            }
          }}
        />
      </View>
      <UserList
        ListEmptyComponent={renderEmptyList}
        users={userList}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel={t( "Select-user" )}
        onPress={onUserSelected}
      />
    </ViewWrapper>
  );
};

export default ExploreUserSearch;
