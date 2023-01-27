// @flow

import Heading4 from "components/SharedComponents/Typography/Heading4";
import { Pressable } from "components/styledComponents";
import * as React from "react";
import { ActivityIndicator } from "react-native-paper";

type ButtonProps = {
  text: string,
  disabled?: boolean,
  onPress: any,
  level?: string,
  testID?: string,
  loading?: boolean,
  style?: any,
  className?: string
}

const setStyles = ( {
  level,
  disabled,
  className
} ) => {
  let buttonClass = "rounded flex-row justify-center items-center py-1.5 px-8";
  let textClass = "text-white tracking-widest";

  if ( className ) {
    buttonClass = buttonClass.concat( " ", className );
  }

  if ( level === "warning" ) {
    buttonClass = buttonClass.concat( " ", "bg-warningRed" );
  } else if ( level === "primary" ) {
    buttonClass = buttonClass.concat( " ", "bg-darkGray" );
  } else if ( level === "focus" ) {
    buttonClass = buttonClass.concat( " ", "bg-inatGreen" );
  } else {
    buttonClass = buttonClass.concat( " ", "border border-darkGray border-[2.6px]" );
    textClass = textClass.concat( " ", "color-darkGray" );
  }

  if ( disabled ) {
    buttonClass = buttonClass.concat( " ", "opacity-[0.5]" );
  }

  return { buttonClass, textClass };
};

const Button = ( {
  text, onPress, disabled, testID, level, loading, style, className
}: ButtonProps ): React.Node => {
  const { buttonClass, textClass } = setStyles( { disabled, level, className } );

  return (
    <Pressable
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
    >
      {loading && <ActivityIndicator size={18} className="mr-2" />}
      <Heading4 className={textClass}>
        {text}
      </Heading4>
    </Pressable>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
