// @flow
import { useRoute } from "@react-navigation/native";
import { deleteQualityMetric, fetchQualityMetrics, setQualityMetric } from "api/qualityMetrics";
import DQAVoteButtons from "components/ObsDetails/DQAVoteButtons";
import {
  Body3,
  Divider,
  Heading4,
  INatIcon,
  List1,
  List2,
  ScrollViewWrapper
} from "components/SharedComponents";
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus/QualityGradeStatus";
import { View } from "components/styledComponents";
import { t } from "i18next";
import {
  useEffect, useState
} from "react";
import * as React from "react";
import { useTheme } from "react-native-paper";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

const titleOption = option => {
  switch ( option ) {
    case "research":
      return t( "Data-quality-assessment-title-research" );
    case "needs_id":
      return t( "Data-quality-assessment-title-needs-id" );
    default:
      return t( "Data-quality-assessment-title-casual" );
  }
};

const titleDescription = option => {
  switch ( option ) {
    case "research":
      return t( "Data-quality-assessment-description-research" );
    case "needs_id":
      return t( "Data-quality-assessment-description-needs-id" );
    default:
      return t( "Data-quality-assessment-description-casual" );
  }
};

const DataQualityAssessment = ( ): React.Node => {
  const { params } = useRoute( );
  const { observationUUID, qualityGrade } = params;
  const isResearchGrade = qualityGrade === "research";
  const theme = useTheme( );
  const sectionClass = "flex-row ml-[15px] my-[14px] space-x-[11px]";
  const voteClass = "flex-row mx-[15px] my-[7px] justify-between items-center";
  const listTextClass = "flex-row space-x-[11px]";
  const [qualityMetrics, setQualityMetrics] = useState( null );
  const [loadingAgree, setLoadingAgree] = useState( false );
  const [loadingDisagree, setLoadingDisagree] = useState( false );
  const [loadingMetric, setLoadingMetric] = useState( null );

  const fetchMetricsParams = {
    id: observationUUID,
    fields: "metric,agree,user_id",
    ttl: -1
  };

  const createFetchQualityMetricsMutation = useAuthenticatedMutation(
    ( PARAMS, optsWithAuth ) => fetchQualityMetrics( PARAMS, optsWithAuth ),
    {
      onSuccess: response => {
        console.log( response );
        setLoadingMetric( null );
        if ( loadingAgree ) {
          setLoadingAgree( false );
        }
        if ( loadingDisagree ) {
          setLoadingDisagree( false );
        }
        setQualityMetrics( response );
      },
      onError: error => {
        console.log( "error", error );
      }
    }
  );

  useEffect( ( ) => {
    if ( qualityMetrics === null ) {
      createFetchQualityMetricsMutation.mutate( fetchMetricsParams );
    }
    // render once on mount and reduces number of calls overall.
    // Not sure what the better option is instead of disabling eslint
    // since I cant use hooks in useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  const createQualityMetricMutation = useAuthenticatedMutation(
    ( PARAMS, optsWithAuth ) => setQualityMetric( PARAMS, optsWithAuth ),
    {
      onSuccess: response => {
        console.log( "success", response );
        // fetch updated quality metrics with new vote
        createFetchQualityMetricsMutation.mutate( fetchMetricsParams );
      },
      onError: error => {
        console.log( "error", error );
      }
    }
  );

  const setMetricVote = ( metric, vote ) => {
    const PARAMS = {
      id: observationUUID,
      metric,
      agree: vote,
      ttyl: -1
    };
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }
    createQualityMetricMutation.mutate( PARAMS );
  };

  const createRemoveQualityMetricMutation = useAuthenticatedMutation(
    ( PARAMS, optsWithAuth ) => deleteQualityMetric( PARAMS, optsWithAuth ),
    {
      onSuccess: response => {
        console.log( "success", response );
        // fetch updated quality metrics with new vote
        createFetchQualityMetricsMutation.mutate( fetchMetricsParams );
      },
      onError: error => {
        console.log( "error", error );
      }
    }
  );

  const removeMetricVote = ( metric, vote ) => {
    const PARAMS = {
      id: observationUUID,
      metric,
      ttyl: -1
    };
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }
    createRemoveQualityMetricMutation.mutate( PARAMS );
  };

  const checkTest = metric => {
    if ( qualityMetrics ) {
      const match = qualityMetrics.find( element => (
        element.metric === metric && element.user_id ) );
      if ( match && match.agree === true ) { return true; }
      if ( match && match.agree === false ) { return false; }
    }
    return null;
  };

  const renderIndicator = metric => {
    const ifAgree = checkTest( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} /> );
    }
    return (
      <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
    );
  };

  return (
    <ScrollViewWrapper testID="DataQualityAssessment">
      <View className="mx-[26px] my-[19px] space-y-[9px]">
        <QualityGradeStatus
          qualityGrade={qualityGrade}
          color={( qualityGrade === "research" )
            ? theme.colors.secondary
            : theme.colors.primary}
        />
        <View className="flex-row space-x-[7px]">
          {isResearchGrade
          && (
            <INatIcon
              name="checkmark-circle"
              size={19}
              color={theme.colors.secondary}
            />
          )}
          <List1 className="text-black">
            {titleOption( qualityGrade )}
          </List1>
        </View>
        <List2 className="text-black">
          {titleDescription( qualityGrade )}
        </List2>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator( ) }
        <Body3>{t( "Data-quality-assessment-date-specified" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator( )}
        <Body3>{t( "Data-quality-assessment-location-specified" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-has-photos-or-sounds" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-id-supported-by-two-or-more" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-community-taxon-at-species-level-or-lower" )}</Body3>
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "date" )}
          <Body3>{t( "Data-quality-assessment-date-is-accurate" )}</Body3>
        </View>
        <DQAVoteButtons
          metric="date"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "location" )}
          <Body3>{t( "Data-quality-assessment-location-is-accurate" )}</Body3>
        </View>
        <DQAVoteButtons
          metric="location"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "wild" )}
          <Body3>{t( "Data-quality-assessment-organism-is-wild" )}</Body3>
        </View>
        <DQAVoteButtons
          metric="wild"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "evidence" )}
          <Body3>{t( "Data-quality-assessment-evidence-of-organism" )}</Body3>
        </View>
        <DQAVoteButtons
          metric="evidence"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "recent" )}
          <Body3>{t( "Data-quality-assessment-recent-evidence-of-organism" )}</Body3>
        </View>
        <DQAVoteButtons
          metric="recent"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>
      <Divider />

      <View className="flex-row bg-lightGray px-[15px] py-[7px] mt-[20px]">
        <Body3 className="shrink">
          {t(
            "Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence"
          )}
        </Body3>
        <DQAVoteButtons
          metric="needs_id"
          qualityMetrics={qualityMetrics}
          setVote={setMetricVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeMetricVote}
        />
      </View>

      <View className="mt-[30px] mx-[15px] space-y-[11px]">
        <Heading4>{t( "ABOUT-THE-DQA" )}</Heading4>
        <List2>{t( "About-the-DQA-description" )}</List2>
      </View>

    </ScrollViewWrapper>
  );
};

export default DataQualityAssessment;
