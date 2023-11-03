// @flow
import classnames from "classnames";
import FlagItemModal from "components/ObsDetails/FlagItemModal";
import {
  Body4, INatIcon, InlineUser, TextInputSheet, WarningSheet
} from "components/SharedComponents";
import KebabMenu from "components/SharedComponents/KebabMenu";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Menu } from "react-native-paper";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import colors from "styles/tailwindColors";

type Props = {
  item: Object,
  currentUser: boolean,
  classNameMargin?: string,
  idWithdrawn: boolean,
  flagged: boolean,
  updateCommentBody: Function,
  deleteComment: Function,
  withdrawOrRestoreIdentification: Function,
  onItemFlagged:Function

}

const ActivityHeader = ( {
  item, classNameMargin, currentUser,
  idWithdrawn, flagged, updateCommentBody, deleteComment, withdrawOrRestoreIdentification,
  onItemFlagged
}:Props ): Node => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [flagModalVisible, setFlagModalVisible] = useState( false );
  const [showEditCommentSheet, setShowEditCommentSheet] = useState( false );
  const [showDeleteCommentSheet, setShowDeleteCommentSheet] = useState( false );
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

  const closeFlagItemModal = () => {
    setFlagModalVisible( false );
  };

  return (
    <View className={classnames( "flex-row justify-between", classNameMargin )}>
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
        {( itemType === "Identification" && currentUser )
          && (
            <KebabMenu
              visible={kebabMenuVisible}
              setVisible={setKebabMenuVisible}
            >
              {item.current === true
                ? (
                  <Menu.Item
                    onPress={async ( ) => {
                      withdrawOrRestoreIdentification( false );
                      setKebabMenuVisible( false );
                    }}
                    title={t( "Withdraw" )}
                    testID="MenuItem.Withdraw"
                  />
                )
                : (
                  <Menu.Item
                    onPress={async ( ) => {
                      withdrawOrRestoreIdentification( true );
                      setKebabMenuVisible( false );
                    }}
                    title={t( "Restore" )}
                  />
                )}
            </KebabMenu>
          )}
        {
          ( itemType === "Comment" && item.body && currentUser )
            && (
              <KebabMenu
                visible={kebabMenuVisible}
                setVisible={setKebabMenuVisible}
              >
                <Menu.Item
                  onPress={async ( ) => {
                    setShowEditCommentSheet( true );
                    setKebabMenuVisible( false );
                  }}
                  title={t( "Edit-comment" )}
                  testID="MenuItem.EditComment"
                />
                <Menu.Item
                  onPress={async ( ) => {
                    setShowDeleteCommentSheet( true );
                    setKebabMenuVisible( false );
                  }}
                  title={t( "Delete-comment" )}
                  testID="MenuItem.DeleteComment"
                />
              </KebabMenu>
            )
        }
        {
          !currentUser
          && (
            <KebabMenu
              visible={kebabMenuVisible}
              setVisible={setKebabMenuVisible}
            >
              {!currentUser
                ? (
                  <Menu.Item
                    onPress={() => setFlagModalVisible( true )}
                    title={t( "Flag" )}
                    testID="MenuItem.Flag"
                  />
                )
                : undefined}
              <View />
            </KebabMenu>
          )
        }

        {!currentUser
        && (
          <FlagItemModal
            id={item.id}
            showFlagItemModal={flagModalVisible}
            closeFlagItemModal={closeFlagItemModal}
            itemType={itemType}
            onItemFlagged={onItemFlagged}
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
