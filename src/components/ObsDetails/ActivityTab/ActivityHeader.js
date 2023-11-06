// @flow
import classnames from "classnames";
import ActivityHeaderKebabMenu from "components/ObsDetails/ActivityTab/ActivityHeaderKebabMenu";
import DeleteCommentSheet from "components/ObsDetails/Sheets/DeleteCommentSheet";
import WithdrawIDSheet from "components/ObsDetails/Sheets/WithdrawIDSheet";
import {
  Body4, INatIcon, InlineUser, TextInputSheet, WarningSheet
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import colors from "styles/tailwindColors";

type Props = {
  item: Object,
  currentUser: boolean,
  classNameMargin?: string,
  idWithdrawn: boolean,
  flagged: boolean,
  loading: boolean,
  updateCommentBody: Function,
  deleteComment: Function,
  withdrawOrRestoreIdentification: Function,

}

const ActivityHeader = ( {
  item, classNameMargin, currentUser,
  idWithdrawn, flagged, loading, updateCommentBody, deleteComment, withdrawOrRestoreIdentification
}:Props ): Node => {
  const [showEditCommentSheet, setShowEditCommentSheet] = useState( false );
  const [showDeleteCommentSheet, setShowDeleteCommentSheet] = useState( false );
  const [showWithdrawIDSheet, setShowWithdrawIDSheet] = useState( false );
  const { user } = item;

  const itemType = item.category
    ? "Identification"
    : "Comment";

  const renderIcon = () => {
    if ( idWithdrawn ) {
      return (
        <View className="opacity-50">
          <INatIcon name="ban" color={colors.primary} size={22} />
        </View>
      );
    }
    if ( item.vision ) return <INatIcon name="sparkly-label" size={22} />;
    if ( flagged ) return <INatIcon name="flag" color={colors.warningYellow} size={22} />;
    return null;
  };

  const renderStatus = () => {
    if ( flagged ) {
      return (
        <Body4>
          {t( "Flagged" )}
        </Body4>
      );
    }
    if ( idWithdrawn ) {
      return (
        <Body4>
          { t( "ID-Withdrawn" )}
        </Body4>
      );
    }
    if ( item.category ) {
      return (
        <Body4>
          { t( `Category-${item.category}` )}
        </Body4>
      );
    }
    return (
      <Body4 />
    );
  };

  return (
    <View className={classnames( "flex-row justify-between h-[26px] my-[11px]", classNameMargin )}>
      <InlineUser user={user} />
      <View className="flex-row items-center space-x-[15px]">
        {renderIcon()}
        {
          renderStatus()
        }
        {item.created_at
            && (
              <Body4>
                {formatIdDate( item.updated_at || item.created_at, t )}
              </Body4>
            )}
        {
          loading
            ? (
              <View className="mr-[20px]">
                <ActivityIndicator size={10} />
              </View>
            )
            : (
              <ActivityHeaderKebabMenu
                currentUser={currentUser}
                itemType={itemType}
                current={item.current}
                itemBody={item.body}
                setShowWithdrawIDSheet={setShowWithdrawIDSheet}
                withdrawOrRestoreIdentification={withdrawOrRestoreIdentification}
                setShowEditCommentSheet={setShowEditCommentSheet}
                setShowDeleteCommentSheet={setShowDeleteCommentSheet}
              />
            )
        }

        {showWithdrawIDSheet && (
          <WithdrawIDSheet
            handleClose={() => setShowWithdrawIDSheet( false )}
            taxon={item.taxon}
            withdrawOrRestoreIdentification={withdrawOrRestoreIdentification}
          />
        )}
        {showDeleteCommentSheet && (
          <DeleteCommentSheet
            handleClose={() => setShowDeleteCommentSheet( false )}
            deleteComment={() => deleteComment( item.uuid )}
          />
        )}
        {( currentUser && showEditCommentSheet ) && (
          <TextInputSheet
            handleClose={() => setShowEditCommentSheet( false )}
            headerText={t( "EDIT-COMMENT" )}
            initialInput={item.body}
            snapPoints={[416]}
            confirm={textInput => updateCommentBody( textInput )}
          />
        )}
        {( currentUser && showDeleteCommentSheet ) && (
          <WarningSheet
            handleClose={( ) => setShowDeleteCommentSheet( false )}
            headerText={t( "DELETE-COMMENT" )}
            snapPoints={[148]}
            confirm={deleteComment}
            buttonText={t( "DELETE" )}
            handleSecondButtonPress={( ) => setShowDeleteCommentSheet( false )}
            secondButtonText={t( "CANCEL" )}
          />
        )}
      </View>
    </View>
  );
};

export default ActivityHeader;
