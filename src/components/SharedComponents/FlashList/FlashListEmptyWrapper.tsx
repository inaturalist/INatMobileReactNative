import classnames from "classnames";
import { View } from "components/styledComponents";
import React from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FOOTER_HEIGHT = 77;

interface Props {
  children: React.Node;
  headerHeight: number;
  emptyItemHeight: number;
}

const FlashListEmptyWrapper = ( {
  children,
  headerHeight: HEADER_HEIGHT,
  emptyItemHeight: EMPTY_ITEM_HEIGHT
}: Props ) => {
  const insets = useSafeAreaInsets( );
  const { height } = useWindowDimensions( );

  const outerViewHeight = (
    height + insets.top - HEADER_HEIGHT - FOOTER_HEIGHT - ( EMPTY_ITEM_HEIGHT / 2 )
  ) * 0.5;

  return (
  // It seems to be a known issue that the EmptyListComponent of FlashList,
  // which is the parent here, is not possible to be used with a flex of 1, or flex grow.
  // The following workaround is to roughly center the content.
  // https://github.com/Shopify/flash-list/discussions/517
    <View
      className="px-[67px] items-center"
      style={{ height: outerViewHeight }}
    >
      <View className={classnames(
        "items-center absolute top-[50%]"
      )}
      >
        {children}
      </View>
    </View>
  );
};

export default FlashListEmptyWrapper;
