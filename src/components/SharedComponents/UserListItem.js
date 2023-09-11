// @flow
import {
  Body1, List2, UserIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import User from "realmModels/User";
import { useTranslation } from "sharedHooks";

type Props = {
  item: Object,
  count: number,
  countText: string
};

const UserListItem = ( { item, count, countText }: Props ): Node => {
  const { t } = useTranslation( );
  const user = item?.user;

  if ( !user ) { return null; }
  return (
    <View
      className="flex-row items-center mx-3 my-2"
      testID={`UserProfile.${user.id}`}
    >

      <UserIcon uri={User.uri( user )} medium />
      <View className="ml-3">
        <Body1 className="mt-3">{user.login}</Body1>
        <List2 className="mt-1">
          {t( countText, { count } )}
        </List2>
      </View>
    </View>
  );
};

export default UserListItem;
