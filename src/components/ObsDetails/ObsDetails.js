// @flow
import { useRoute } from "@react-navigation/native";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  HideView,
  Tabs,
  TextInputSheet
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Platform, StatusBar } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  useTranslation
} from "sharedHooks";

import ActivityTab from "./ActivityTab/ActivityTab";
import FloatingButtons from "./ActivityTab/FloatingButtons";
import DetailsTab from "./DetailsTab/DetailsTab";
import FaveButton from "./FaveButton";
import ObsDetailsHeader from "./ObsDetailsHeader";
import ObsDetailsOverview from "./ObsDetailsOverview";
import ObsMediaDisplayContainer from "./ObsMediaDisplayContainer";

type Props = {
  activityItems: Array<Object>,
  addingActivityItem: Function,
  agreeIdSheetDiscardChanges: Function,
  belongsToCurrentUser: boolean,
  currentTabId: string,
  currentUser: Object,
  hideCommentBox: Function,
  isOnline: boolean,
  navToSuggestions: Function,
  observation: Object,
  onAgree: Function,
  onCommentAdded: Function,
  onIDAgreePressed: Function,
  openCommentBox: Function,
  openCommentBox: Function,
  refetchRemoteObservation: Function,
  showActivityTab: boolean,
  showAgreeWithIdSheet: boolean,
  showCommentBox: Function,
  tabs: Array<Object>,
  taxonForAgreement: ?Object
}

const ObsDetails = ( {
  activityItems,
  addingActivityItem,
  agreeIdSheetDiscardChanges,
  belongsToCurrentUser,
  currentTabId,
  currentUser,
  hideCommentBox,
  isOnline,
  navToSuggestions,
  observation,
  onAgree,
  onCommentAdded,
  onIDAgreePressed,
  openCommentBox,
  refetchRemoteObservation,
  showActivityTab,
  showAgreeWithIdSheet,
  showCommentBox,
  tabs,
  taxonForAgreement
}: Props ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );
  const [passedPhotos, setPassedPhotos] = useState( false );

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[0, 3]}
        scrollEventThrottle={16}
        className="flex-1 flex-column"
        stickyHeaderHiddenOnScroll
        endFillColor="white"
        onScroll={scrollEvent => {
          if ( !passedPhotos && scrollEvent.nativeEvent.contentOffset.y > 244 ) {
            setPassedPhotos( true );
          } else if ( passedPhotos && scrollEvent.nativeEvent.contentOffset.y <= 244 ) {
            setPassedPhotos( false );
          }
        }}
      >
        <ObsDetailsHeader
          belongsToCurrentUser={belongsToCurrentUser}
          observation={observation}
        />
        <View
          // TODO don't hardcode this, should be based on the calculated
          // height of the nav header
          className="mt-[-44px]"
        >
          <ObsMediaDisplayContainer observation={observation} />
          { currentUser && (
            <FaveButton
              observation={observation}
              currentUser={currentUser}
              afterToggleFave={refetchRemoteObservation}
            />
          ) }
        </View>
        <ObsDetailsOverview
          observation={observation}
          isOnline={isOnline}
          belongsToCurrentUser={belongsToCurrentUser}
        />
        <View className="bg-white">
          <Tabs tabs={tabs} activeId={currentTabId} />
        </View>
        <View className="bg-white h-full">
          <HideView show={showActivityTab}>
            <ActivityTab
              observation={observation}
              refetchRemoteObservation={refetchRemoteObservation}
              onIDAgreePressed={onIDAgreePressed}
              activityItems={activityItems}
              isOnline={isOnline}
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
        </View>
      </ScrollView>
      {showActivityTab && (
        <FloatingButtons
          navToSuggestions={navToSuggestions}
          openCommentBox={openCommentBox}
          showCommentBox={showCommentBox}
        />
      )}
      {showAgreeWithIdSheet && (
        <AgreeWithIDSheet
          taxon={taxonForAgreement}
          handleClose={agreeIdSheetDiscardChanges}
          onAgree={onAgree}
        />
      )}
      {/* AddCommentSheet */}
      {showCommentBox && (
        <TextInputSheet
          handleClose={hideCommentBox}
          headerText={t( "ADD-COMMENT" )}
          textInputStyle={textInputStyle}
          confirm={textInput => onCommentAdded( textInput )}
        />
      )}
    </SafeAreaView>
  );
};

export default ObsDetails;
