// @flow

import {
  tailwindFontBold
} from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

const Body3Bold = ( props: any ): Node => (
  <Text
    className={classnames(
      "text-sm font-medium text-darkGray",
      tailwindFontBold
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

export default Body3Bold;
