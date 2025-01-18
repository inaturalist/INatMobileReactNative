import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  ViewStyle
} from "react-native";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityHint?: string;
  accessibilityLabel: string;
  children?: React.ReactNode;
  // There is probably a better way to indicate that this tailwind prop is
  // supported everywhere, but I haven't found it yet. ~~~kueda 20241016
  // eslint-disable-next-line react/no-unused-prop-types
  className?: string,
  color?: string;
  disabled?: boolean;
  height?: number;
  icon: string;
  // Only show the icon with all the same layout, don't make it a button
  iconOnly?: boolean;
  onPress: ( _event?: GestureResponderEvent ) => void;
  // Inserts a white or colored view under the icon so an holes in the shape show as
  // white
  preventTransparency?: boolean;
  size?: number;
  style?: ViewStyle;
  testID?: string;
  width?: number;
  backgroundColor?: string;
  mode?: "contained";
}

const MIN_ACCESSIBLE_DIM = 44;

const WRAPPER_STYLE: ViewStyle = {
  alignItems: "center",
  justifyContent: "center"
};

const CONTAINED_WRAPPER_STYLE: ViewStyle = {
  borderRadius: 9999
};

// Similar to IconButton in react-native-paper, except this allows independent
// control over touchable area with `width` and `height` *and* the size of
// the icon with `size`
const INatIconButton = ( {
  accessibilityHint,
  accessibilityLabel,
  children,
  color,
  disabled = false,
  height = MIN_ACCESSIBLE_DIM,
  icon,
  iconOnly,
  onPress,
  preventTransparency,
  size = 18,
  style,
  testID,
  width = MIN_ACCESSIBLE_DIM,
  backgroundColor,
  mode
}: Props ) => {
  // width || 0 is to placate flow. width should never be undefined because of
  // the defaultProps, but I guess flow can't figure that out.
  if ( ( width || 0 ) < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Width cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`
    );
  }
  if ( ( height || 0 ) < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Height cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`
    );
  }
  if ( !accessibilityLabel && !iconOnly ) {
    throw new Error(
      "Button needs an accessibility label"
    );
  }
  const getOpacity = React.useCallback( ( pressed: boolean ) => {
    if ( disabled ) {
      return 0.5;
    }
    if ( pressed ) {
      return 0.95;
    }
    return 1;
  }, [disabled] );

  const wrapperStyle = React.useMemo( ( ) => ( [
    { width, height },
    WRAPPER_STYLE,
    mode === "contained" && {
      backgroundColor: preventTransparency
        ? undefined
        : backgroundColor,
      ...CONTAINED_WRAPPER_STYLE
    },
    style
  ] ), [
    backgroundColor,
    height,
    mode,
    preventTransparency,
    style,
    width
  ] );

  const content = (
    <View
      className={classnames(
        "relative",
        // This degree of pixel pushing was meant for a ~22px icon, so it
        // might have to be made relative, but it's barely noticeable for
        // most icons
        Platform.OS === "android"
          ? "top-[0.8px]"
          : "left-[0.2px] top-[0.1px]"
      )}
    >
      { backgroundColor && preventTransparency && (
        <View
          // Position and size need to be dynamic
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            opacity: disabled
              ? 0
              : 1,
            position: "absolute",
            top: preventTransparency
              ? 2
              : -2,
            start: preventTransparency
              ? 2
              : -2,
            width: preventTransparency
              ? size - 4
              : size + 4,
            height: preventTransparency
              ? size - 4
              : size + 4,
            backgroundColor,
            borderRadius: 9999
          }}
        />
      )}
      {
        children || (
          <INatIcon
            name={icon}
            size={size}
            color={String( color || colors?.darkGray )}
          />
        )
      }
    </View>
  );

  if ( iconOnly ) {
    return (
      <View style={wrapperStyle} testID={testID}>
        { content }
      </View>
    );
  }

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={( { pressed } ) => [
        ...wrapperStyle,
        { opacity: getOpacity( pressed ) }
      ]}
      testID={testID}
    >
      { content }
    </Pressable>
  );
};

INatIconButton.defaultProps = {
  height: 44,
  size: 18,
  width: 44
};

export default INatIconButton;
