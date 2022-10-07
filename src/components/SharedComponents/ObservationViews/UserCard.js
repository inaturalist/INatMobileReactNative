// @flow

import { useNavigation } from "@react-navigation/native";
import UserIcon from "components/SharedComponents/UserIcon";
import { Pressable, Text, View } from "components/styledComponents";
import useRemoteUser from "components/UserProfile/hooks/useRemoteUser";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/colors";

import User from "../../../models/User";

const UserCard = ( ): Node => {
  const user = useCurrentUser( );
  const { user: remoteUser } = useRemoteUser( user?.id );
  // TODO: this currently doesn't show up on initial login
  // because user id can't be fetched
  const navigation = useNavigation( );
  if ( !user ) { return <View />; }
  const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: user.id } );

  return (
    <View className="flex-row mx-5 items-center">
      <UserIcon uri={{ uri: remoteUser?.icon_url }} large />
      <View className="ml-2">
        <Text className="color-white my-1">{User.userHandle( user )}</Text>
        <Text className="color-white my-1">{`${user.observations_count} Observations`}</Text>
      </View>
      <Pressable
        onPress={navToUserProfile}
        className="absolute right-0"
      >
        <IconMaterial name="edit" size={30} color={colors.white} />
      </Pressable>
    </View>
  );
};

export default UserCard;
