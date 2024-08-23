// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2
} );

type Props = {
  containerClass?: string,
  children: React.Node
}

// Ensure this component is placed outside of scroll views

const StickyToolbar = ( {
  containerClass,
  children
}: Props ): React.Node => (
  <View
    className={classNames(
      "absolute bg-white bottom-0 p-[15px] w-full",
      containerClass
    )}
    style={DROP_SHADOW}
  >
    {children}
  </View>
);

export default StickyToolbar;
