// @flow

import {
  ActivityIndicator,
  Body3,
  INatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTheme } from "react-native-paper";
import { useCurrentUser, useTranslation } from "sharedHooks";

type Props = {
  metric: string,
  votes: [Object],
  loadingAgree: boolean,
  loadingDisagree: boolean,
  loadingMetric: ?string,
  setVote: Function,
  removeVote: Function
}

const getUserVote = ( currentUser, metric, votes ) => {
  if ( votes && votes.length > 0 ) {
    const match = votes.find( element => ( element.user_id === currentUser?.id ) );
    if ( match ) {
      if ( metric === "needs_id" ) {
        return match.vote_flag === true;
      }
      return match.agree === true;
    }
  }
  return null;
};

const renderVoteCount = ( status, metric, votes ) => {
  if ( !votes ) return null;

  const count = votes
    ?.filter( qualityMetric => {
      if ( metric === "needs_id" ) {
        return qualityMetric.vote_flag === status;
      }
      return qualityMetric.agree === status;
    } )
    ?.length;
  if ( !count || count === 0 ) return null;

  return <Body3 classname="ml-[5px]">{count}</Body3>;
};

const DQAVoteButtons = ( {
  metric,
  votes,
  loadingAgree,
  loadingDisagree,
  loadingMetric,
  setVote,
  removeVote
}: Props ): React.Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const currentUser = useCurrentUser( );
  const userAgrees = getUserVote( currentUser, metric, votes );
  const activityIndicatorOffset = "mx-[7px]";

  const renderAgree = () => {
    if ( loadingAgree && loadingMetric === metric ) {
      return ( <ActivityIndicator size={33} className={activityIndicatorOffset} /> );
    }
    if ( userAgrees ) {
      return (
        <INatIconButton
          testID="DQAVoteButton.UserAgree"
          icon="arrow-up-bold-circle"
          size={33}
          color={theme.colors.secondary}
          onPress={() => removeVote( { metric, vote: true } )}
          accessibilityLabel={t( "Arrow-up-selected" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyAgree"
        icon="arrow-up-bold-circle-outline"
        size={33}
        onPress={() => setVote( { metric, vote: true } )}
        accessibilityLabel={t( "Arrow-up-unselected" )}
      />
    );
  };

  const renderDisagree = () => {
    if ( loadingDisagree && loadingMetric === metric ) {
      return ( <ActivityIndicator size={30} className={activityIndicatorOffset} /> );
    }

    if ( userAgrees === false ) {
      return (
        <INatIconButton
          testID="DQAVoteButton.UserDisagree"
          icon="arrow-down-bold-circle"
          size={33}
          color={theme.colors.error}
          onPress={() => removeVote( { metric, vote: false } )}
          accessibilityLabel={t( "Arrow-down-selected" )}
        />
      );
    }
    return (
      <INatIconButton
        testID="DQAVoteButton.EmptyDisagree"
        icon="arrow-down-bold-circle-outline"
        size={33}
        onPress={() => setVote( { metric, vote: false } )}
        accessibilityLabel={t( "Arrow-down-unselected" )}
      />
    );
  };

  return (
    <View className="flex-row items-center justify-between w-[97px] space-x-[11px]">
      <View className="flex-row items-center w-1/2">
        {renderAgree()}
        {renderVoteCount( true, metric, votes )}
      </View>
      <View className="flex-row items-center w-1/2">
        {renderDisagree()}
        {renderVoteCount( false, metric, votes )}
      </View>
    </View>
  );
};

export default DQAVoteButtons;
