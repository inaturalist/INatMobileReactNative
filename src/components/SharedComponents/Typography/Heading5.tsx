import { tailwindFontBold } from "appConstants/fontFamilies.ts";
import React from "react";
import { TextProps } from "react-native";

import InatText from "./InatText";

const Heading5 = ( props: TextProps ) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <InatText className={`text-2xs tracking-wide ${tailwindFontBold}`} {...props} />
);

export default Heading5;
