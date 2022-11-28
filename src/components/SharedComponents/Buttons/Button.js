// @flow

import { Text } from "components/styledComponents";
import * as React from "react";
import { Button as ButtonRNP } from "react-native-paper";

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
  let buttonClass = "rounded-3xl h-13";

  if ( className ) {
    buttonClass += ` ${className}`;
  }

  if ( level === "warning" ) {
    buttonClass += buttonClass.concat( " ", "bg-buttonWarning" );
  } else if ( level === "primary" ) {
    buttonClass += buttonClass.concat( " ", "bg-buttonPrimary" );
  } else {
    buttonClass += buttonClass.concat( " ", "bg-buttonNeutral" );
  }

  if ( disabled ) {
    if ( level === "warning" ) {
      buttonClass += buttonClass.concat( " ", "bg-buttonWarningDisabled" );
    } else if ( level === "primary" ) {
      buttonClass += buttonClass.concat( " ", "bg-buttonPrimaryDisabled" );
    } else {
      buttonClass += buttonClass.concat( " ", "bg-buttonNeutralDisabled" );
    }
  }

  return { buttonClass };
};

const Button = ( {
  text, onPress, disabled, testID, level, loading, style, className
}: ButtonProps ): React.Node => {
  const { buttonClass } = setStyles( { disabled, level, className } );

  return (
    <ButtonRNP
      onPress={onPress}
      className={buttonClass}
      style={style}
      disabled={disabled}
      testID={testID}
      loading={loading}
    >
      <Text className="text-lg text-white font-semibold">
        {text}
      </Text>
    </ButtonRNP>
  );
};

Button.defaultProps = {
  disabled: false,
  level: "neutral"
};
export default Button;
