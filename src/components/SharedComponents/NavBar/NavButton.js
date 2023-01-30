// @flow
import { useRoute } from "@react-navigation/native";
import { Image, Pressable, View } from "components/styledComponents";
import * as React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  icon: any,
  onPress: any,
  id?: string,
  img?: string,
  accessibilityLabel: string,
  accessibilityRole?: string
};

const NavButton = ( {
  icon,
  onPress,
  id,
  img,
  accessibilityLabel,
  accessibilityRole = "link"
}: Props ): React.Node => {
  const { name } = useRoute();
  const backgroundColor = {
    backgroundColor: name === id ? colors.primary : "transparent"
  };
  return (
    <Pressable
      className="h-9 bg"
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {img ? (
        <View className="w-9 h-9 rounded-full" style={backgroundColor}>
          <Image
            accessibilityRole="img"
            className="w-8 h-8 rounded-full m-auto"
            source={img}
          />
        </View>
      ) : (
        <IconMaterial
          accessibilityRole="img"
          name={icon}
          size={35}
          color={name === id ? colors.primary : colors.logInGray}
        />
      )}
    </Pressable>
  );
};

export default NavButton;
