// @flow

import classnames from "classnames";
import { ActivityIndicator, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  layout?: string,
  isOnline?: boolean,
  hideLoadingWheel: boolean,
  explore: boolean
}

const InfiniteScrollLoadingWheel = ( {
  hideLoadingWheel, layout, isOnline, explore
}: Props ): Node => {
  const { t } = useTranslation( );

  const loadingWheelClass = explore
    ? "h-[128px] py-16"
    : "h-64 py-16";
  if ( hideLoadingWheel ) {
    return <View className={loadingWheelClass} testID="InfiniteScrollLoadingWheel.footerView" />;
  }
  return (
    <View className={classnames( loadingWheelClass, {
      "border-t border-lightGray": layout === "list"
    } )}
    >
      {!isOnline
        ? (
          <Body3 className="text-center">
            {t( "An-Internet-connection-is-required" )}
          </Body3>
        )
        : (
          <ActivityIndicator
            testID="InfiniteScrollLoadingWheel.loading"
            size={25}
          />
        )}
    </View>
  );
};

export default InfiniteScrollLoadingWheel;
