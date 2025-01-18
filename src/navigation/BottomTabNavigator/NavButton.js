// @flow
import { Body3, INatIconButton, UserIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import NotificationsIconContainer from "navigation/BottomTabNavigator/NotificationsIconContainer";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
  testID: string,
  icon: string,
  onPress: Function,
  userIconUri?: string,
  accessibilityLabel: string,
  accessibilityRole?: string,
  accessibilityHint?: string,
  active: boolean,
  size: number,
  width?: number,
  height?: number
};

const NavButton = ( {
  testID,
  size,
  icon,
  onPress,
  userIconUri,
  active,
  accessibilityLabel,
  accessibilityHint,
  width = 44,
  height = 44
}: Props ): React.Node => {
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    testID,
    width,
    height
  };

  let iconComponent;
  if ( userIconUri ) {
    iconComponent = (
      <View
        className="flex items-center justify-center"
        {...sharedProps}
      >
        <UserIcon uri={userIconUri} active={active} />
      </View>
    );
  } else if ( icon === "notifications-bell" ) {
    iconComponent = (
      <NotificationsIconContainer
        icon={icon}
        size={size}
        active={active}
        {...sharedProps}
      />
    );
  } else {
    iconComponent = (
      <INatIconButton
        icon={icon}
        iconOnly
        color={active
          ? colors.inatGreen
          : colors.darkGray}
        size={size}
        {...sharedProps}
      />
    );
  }

  return (
    <Pressable
      className="flex-column items-center w-[20%] justify-end"
      onPress={onPress}
      key={`NavButton-${accessibilityLabel}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        selected: active,
        disabled: false
      }}
    >
      {iconComponent}
      <Body3
        numberOfLines={1}
        className={active
          ? "text-inatGreen"
          : "text-darkGray"}
        maxFontSizeMultiplier={1.2}
      >
        {accessibilityLabel}
      </Body3>
    </Pressable>
  );
};

export default NavButton;
