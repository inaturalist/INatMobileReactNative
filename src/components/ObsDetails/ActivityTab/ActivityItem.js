// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Divider, INatIconButton, UserText
} from "components/SharedComponents";
import DisplayTaxon from "components/SharedComponents/DisplayTaxon";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React from "react";

import ActivityHeaderContainer from "./ActivityHeaderContainer";
import DisagreementText from "./DisagreementText";

type Props = {
  currentUserId?: number,
  isFirstDisplay: boolean,
  isConnected: boolean,
  item: Object,
  openAgreeWithIdSheet: Function,
  refetchRemoteObservation: Function,
  userAgreedId?: string,
  geoprivacy: string,
  taxonGeoprivacy: string,
  belongsToCurrentUser: boolean
}

const ActivityItem = ( {
  currentUserId,
  isFirstDisplay,
  isConnected,
  item,
  openAgreeWithIdSheet,
  refetchRemoteObservation,
  userAgreedId,
  geoprivacy,
  taxonGeoprivacy,
  belongsToCurrentUser
}: Props ): Node => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { taxon, user, disagreement } = item;
  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;
  const showAgreeButton = user?.id !== currentUserId
    && userAgreedId !== taxon?.id
    && taxon?.is_active
    && isFirstDisplay
    && currentUserId;

  const navToTaxonDetails = ( ) => (
    navigation.navigate( {
      // Ensure button mashing doesn't open multiple TaxonDetails instances
      key: `${route.key}-ActivityItem-TaxonDetails-${taxon.id}`,
      name: "TaxonDetails",
      params: { id: taxon.id }
    } )
  );

  return (
    <View className="flex-column">
      <View className="mx-[15px] pb-[7px]">
        <ActivityHeaderContainer
          item={item}
          refetchRemoteObservation={refetchRemoteObservation}
          idWithdrawn={idWithdrawn}
          isConnected={isConnected}
          geoprivacy={geoprivacy}
          taxonGeoprivacy={taxonGeoprivacy}
          belongsToCurrentUser={belongsToCurrentUser}
        />
        {taxon && (
          <View className="flex-row items-center justify-between mr-[23px] mb-4 mt-1">
            <DisplayTaxon
              taxon={taxon}
              handlePress={navToTaxonDetails}
              accessibilityHint={t( "Navigates-to-taxon-details" )}
              withdrawn={idWithdrawn}
            />
            { showAgreeButton && (
              <INatIconButton
                testID={`ActivityItem.AgreeIdButton.${item.taxon.id}`}
                onPress={( ) => openAgreeWithIdSheet( item.taxon )}
                icon="id-agree"
                size={33}
                accessibilityLabel={t( "Agree" )}
              />
            )}
          </View>
        )}
        { !_.isEmpty( item?.body ) && (
          <View className="flex-row">
            <UserText text={item.body} />
          </View>
        )}
        { disagreement && (
          <DisagreementText
            taxon={item.previous_observation_taxon}
            username={user.login}
            withdrawn={idWithdrawn}
          />
        )}
      </View>
      <Divider />
    </View>
  );
};

export default ActivityItem;
