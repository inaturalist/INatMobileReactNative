// @flow

import { Image, Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import User from "realmModels/User";
import colors from "styles/tailwindColors";

type Props = {
  user: any,
};

const InlineUser = ( { user }: Props ): Node => {
  const userImgUri = User.uri( user );
  const username = `@${user.login}`;
  return (
    <View className="flex flex-row items-center">
      {userImgUri ? (
        <Image className="w-8 h-8 rounded-full mr-1.5" source={userImgUri} />
      ) : (
        <IconMaterial name="person" size={32} color={colors.logInGray} />
      )}
      <Text>{username}</Text>
    </View>
  );
};

export default InlineUser;
