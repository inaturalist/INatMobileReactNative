// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import INatIcon from "components/INatIcon";
import ActivityHeader from "components/ObsDetails/ActivityHeader";
import UserText from "components/SharedComponents/UserText";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useIsConnected from "sharedHooks/useIsConnected";
import { textStyles } from "styles/obsDetails/obsDetails";

import TaxonImage from "./TaxonImage";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function,
  // onAgree?: Function
}

const ActivityItem = ( {
  item, navToTaxonDetails, toggleRefetch, refetchRemoteObservation
}: Props ): Node => {
  const { taxon } = item;
  const isOnline = useIsConnected( );

  const showNoInternetIcon = accessibilityLabel => (
    <View className="mr-3">
      <IconMaterial
        name="wifi-off"
        size={30}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );

  return (
    <View className="flex-column mx-3">
      <ActivityHeader
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        toggleRefetch={toggleRefetch}
      />
      {taxon && (
        <View className="flex-row items-center justify-between">
          <Pressable
            className="flex-row my-3 ml-3 items-center"
            onPress={navToTaxonDetails}
            accessibilityRole="link"
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
          >
            {isOnline
              ? <TaxonImage uri={Taxon.uri( taxon )} />
              : showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) )}
            <DisplayTaxonName scientificNameFirst={false} taxon={taxon} layout="vertical" />
          </Pressable>
          <Pressable
            className="m-4"
            accessibilityRole="button"
          >
            <INatIcon name="id-agree" size={33} />
          </Pressable>
        </View>
      )}
      { !_.isEmpty( item?.body ) && (
        <View className="flex-row">
          <UserText baseStyle={textStyles.activityItemBody} text={item.body} />
        </View>
      )}
    </View>
  );
};

export default ActivityItem;
