// @flow
import { useRoute } from "@react-navigation/native";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  ActivityIndicator,
  HideView,
  Tabs,
  TextInputSheet,
  WarningSheet
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform, StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
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

const isTablet = DeviceInfo.isTablet();

type Props = {
  activityItems: Array<Object>,
  addingActivityItem: Function,
  agreeIdSheetDiscardChanges: Function,
  belongsToCurrentUser: boolean,
  confirmRemoteObsWasDeleted?: Function,
  currentTabId: string,
  currentUser: Object,
  hideCommentBox: Function,
  isOnline: boolean,
  isRefetching: boolean,
  navToSuggestions: Function,
  observation: Object,
  onAgree: Function,
  onCommentAdded: Function,
  onIDAgreePressed: Function,
  openCommentBox: Function,
  openCommentBox: Function,
  refetchRemoteObservation: Function,
  remoteObsWasDeleted?: boolean,
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
  confirmRemoteObsWasDeleted,
  currentTabId,
  currentUser,
  hideCommentBox,
  isOnline,
  isRefetching,
  navToSuggestions,
  observation,
  onAgree,
  onCommentAdded,
  onIDAgreePressed,
  openCommentBox,
  refetchRemoteObservation,
  remoteObsWasDeleted,
  showActivityTab,
  showAgreeWithIdSheet,
  showCommentBox,
  tabs,
  taxonForAgreement
}: Props ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  const renderTablet = () => (
    <View className="flex-1 flex-row bg-white">
      <View className="w-[33%]">
        <ObsMediaDisplayContainer observation={observation} tablet />
        {currentUser && (
          <FaveButton
            observation={observation}
            currentUser={currentUser}
            afterToggleFave={refetchRemoteObservation}
            top
          />
        )}
      </View>
      <View className="w-[66%]">
        <View className="mr-8">
          <ObsDetailsOverview
            belongsToCurrentUser={belongsToCurrentUser}
            isOnline={isOnline}
            isRefetching={isRefetching}
            observation={observation}
          />
        </View>
        <Tabs tabs={tabs} activeId={currentTabId} />
        <ScrollView
          testID={`ObsDetails.${uuid}`}
          stickyHeaderIndices={[0, 3]}
          scrollEventThrottle={16}
          className="flex-1 flex-column"
          stickyHeaderHiddenOnScroll
          endFillColor="white"
        >
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
              <View className="flex-row items-center justify-center p-10">
                <ActivityIndicator size={50} />
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
      </View>
      <ObsDetailsHeader
        belongsToCurrentUser={belongsToCurrentUser}
        observation={observation}
        rightIconBlack
      />
    </View>
  );

  const renderPhone = () => (
    <>
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[0, 3]}
        scrollEventThrottle={16}
        className="flex-1 flex-column"
        stickyHeaderHiddenOnScroll
        endFillColor="white"
      >
        <ObsDetailsHeader
          belongsToCurrentUser={belongsToCurrentUser}
          observation={observation}
        />
        <View>
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
          belongsToCurrentUser={belongsToCurrentUser}
          isOnline={isOnline}
          isRefetching={isRefetching}
          observation={observation}
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
            <View className="flex-row items-center justify-center p-10">
              <ActivityIndicator size={50} />
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
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {!isTablet
        ? renderPhone()
        : renderTablet()}
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
      {/*
        * FWIW, some situations in which this could happen are
        * 1. User loaded obs in explore and it was deleted between then and
          when they tapped on it
        * 2. Some process fetched observations between when they were deleted
          and the search index was updated to reflect that
        *
      */}
      { remoteObsWasDeleted && confirmRemoteObsWasDeleted && (
        <WarningSheet
          handleClose={confirmRemoteObsWasDeleted}
          headerText={t( "OBSERVATION-WAS-DELETED" )}
          text={t( "Sorry-this-observation-was-deleted" )}
          buttonText={t( "OK" )}
          confirm={confirmRemoteObsWasDeleted}
        />
      ) }
    </SafeAreaView>
  );
};

export default ObsDetails;
