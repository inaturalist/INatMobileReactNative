// @flow
import { useRoute } from "@react-navigation/native";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  HideView, Tabs,
  TextInputSheet,
  ViewWrapper
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native-paper";
import {
  useTranslation
} from "sharedHooks";

import ActivityTab from "./ActivityTab/ActivityTab";
import FloatingButtons from "./ActivityTab/FloatingButtons";
import DetailsTab from "./DetailsTab/DetailsTab";
import Header from "./Header";

type Props = {
  navToAddID: Function,
  onCommentAdded: Function,
  openCommentBox: Function,
  tabs: Array<Object>,
  currentTabId: string,
  showCommentBox: Function,
  addingActivityItem: Function,
  observation: Object,
  refetchRemoteObservation: Function,
  hideCommentBox: Function,
  activityItems: Array<Object>,
  showActivityTab: boolean,
  onIDAgreePressed: Function,
  showAgreeWithIdSheet: Function,
  openCommentBox: Function,
  agreeIdSheetDiscardChanges: Function,
  onAgree: Function
}

const ObsDetails = ( {
  navToAddID,
  onCommentAdded,
  openCommentBox,
  tabs,
  currentTabId,
  showCommentBox,
  addingActivityItem,
  observation,
  refetchRemoteObservation,
  hideCommentBox,
  onIDAgreePressed,
  activityItems,
  showActivityTab,
  showAgreeWithIdSheet,
  agreeIdSheetDiscardChanges,
  onAgree
}: Props ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );

  const taxon = observation?.taxon;

  return (
    <ViewWrapper>
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
      >
        <Header
          observation={observation}
          refetchRemoteObservation={refetchRemoteObservation}
        />
        <View className="bg-white">
          <Tabs tabs={tabs} activeId={currentTabId} />
        </View>
        <HideView show={showActivityTab}>
          <ActivityTab
            observation={observation}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            activityItems={activityItems}
          />
        </HideView>
        <HideView noInitialRender show={!showActivityTab}>
          <DetailsTab observation={observation} uuid={uuid} />
        </HideView>
        {addingActivityItem && (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
        <View className="pb-64" />
      </ScrollView>
      {showActivityTab && (
        <FloatingButtons
          navToAddID={navToAddID}
          openCommentBox={openCommentBox}
          showCommentBox={showCommentBox}
        />
      )}
      {showAgreeWithIdSheet && (
        <AgreeWithIDSheet
          taxon={taxon}
          handleClose={( ) => agreeIdSheetDiscardChanges( )}
          onAgree={onAgree}
        />
      )}
      {/* AddCommentSheet */}
      {showCommentBox && (
        <TextInputSheet
          handleClose={hideCommentBox}
          headerText={t( "ADD-OPTIONAL-COMMENT" )}
          snapPoints={[416]}
          confirm={textInput => onCommentAdded( textInput )}
        />
      )}
    </ViewWrapper>
  );
};

export default ObsDetails;
