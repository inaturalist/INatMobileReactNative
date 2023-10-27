// @flow

import classnames from "classnames";
import { SafeAreaView } from "components/styledComponents";
import * as React from "react";
import { StatusBar } from "react-native";

type Props = {
  children: React.Node,
  testID?: string,
  // If someone can explain to me why className doesn't work here, I'm all
  // ears ~~~kueda 20230815
  wrapperClassName?: string
};

const ViewWrapper = ( {
  children,
  wrapperClassName,
  testID
}: Props ): React.Node => (
  <SafeAreaView
    className={classnames( "flex-1", "bg-white", wrapperClassName )}
    testID={testID}
  >
    <StatusBar barStyle="dark-content" />
    {children}
  </SafeAreaView>
);

export default ViewWrapper;
