// @flow

import { useNavigation } from "@react-navigation/native";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body4,
  Button,
  DateDisplay,
  Divider,
  Heading4,
  LabelColonValue,
  QualityGradeStatus
} from "components/SharedComponents";
import UserText from "components/SharedComponents/UserText.tsx";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert, Platform, Share } from "react-native";
import { useTheme } from "react-native-paper";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";

import Attribution from "./Attribution";
import LocationSection from "./LocationSection";

type Props = {
  currentUser: Object,
  observation: Object
}

const OBSERVATION_URL = "https://www.inaturalist.org/observations";

const handleShare = async url => {
  const sharingOptions = {
    url: "",
    message: ""
  };
  if ( Platform.OS === "ios" ) {
    sharingOptions.url = url;
  } else {
    sharingOptions.message = url;
  }
  try {
    return await Share.share( sharingOptions );
  } catch ( err ) {
    Alert.alert( err.message );
    return null;
  }
};

const ViewInBrowserButton = ( { id } ) => (
  <Body4
    className="underline mt-[11px]"
    onPress={async () => openExternalWebBrowser( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "View-in-browser" )}
  </Body4>
);

const ShareButton = ( { id } ) => (
  <Body4
    className="underline mt-[11px]"
    onPress={() => handleShare( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "Share" )}
  </Body4>
);

const qualityGradeOption = option => {
  switch ( option ) {
    case "research":
      return t( "Research-Grade--quality-grade" );
    case "needs_id":
      return t( "Needs-ID--quality-grade" );
    default:
      return t( "Casual--quality-grade" );
  }
};

const qualityGradeDescription = option => {
  switch ( option ) {
    case "research":
      return t( "Data-quality-research-description" );
    case "needs_id":
      return t( "Data-quality-needs-id-description" );
    default:
      return t( "Data-quality-casual-description" );
  }
};

const headingClass = "mt-[20px] mb-[11px] text-darkGray";
const sectionClass = "mx-[15px] mb-[20px]";

const DetailsTab = ( { currentUser, observation }: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );
  const application = observation?.application?.name;
  const qualityGrade = observation?.quality_grade;
  const observationUUID = observation?.uuid;

  const displayQualityGradeOption = option => {
    const isResearchGrade = ( qualityGrade === "research" && option === "research" );
    const labelClassName = ( qualityGrade === option )
      ? "font-bold"
      : "";
    const opacity = ( qualityGrade === option )
      ? "1"
      : "0.5";
    const color = ( isResearchGrade )
      ? theme.colors.secondary
      : theme.colors.primary;
    return (
      <View className="flex-1 flex-col space-y-[8px] items-center">
        <QualityGradeStatus qualityGrade={option} opacity={opacity} color={color} />
        <Body4 className={labelClassName}>{ qualityGradeOption( option ) }</Body4>
      </View>
    );
  };

  if ( !observation ) return null;

  return (
    <>
      {observation.description && (
        <>
          <View className={sectionClass}>
            <Heading4 className={headingClass}>{t( "NOTES" )}</Heading4>
            <UserText>{observation.description}</UserText>
          </View>
          <Divider />
        </>
      )}
      <LocationSection observation={observation} />
      <Divider />
      <View className={sectionClass}>
        <Heading4 className={headingClass}>{t( "DATE" )}</Heading4>
        <DateDisplay
          classNameMargin="mb-[12px]"
          label={t( "Date-observed-header-short" )}
          dateString={checkCamelAndSnakeCase( observation, "timeObservedAt" )}
        />
        <DateDisplay
          label={t( "Date-uploaded-header-short" )}
          dateString={checkCamelAndSnakeCase( observation, "createdAt" )}
        />
      </View>
      <Divider />
      <View className={`${sectionClass} flex-col`}>
        <Heading4 className={headingClass}>{t( "DATA-QUALITY" )}</Heading4>
        <View className="space-y-[15px]">
          <View className="flex-row justify-around">
            {displayQualityGradeOption( "casual" )}
            {displayQualityGradeOption( "needs_id" )}
            {displayQualityGradeOption( "research" )}
          </View>
          <Body4>
            {qualityGradeDescription( qualityGrade )}
          </Body4>
          {currentUser && (
            <Button
              testID="DetailsTab.DQA"
              text={t( "VIEW-DATA-QUALITY-ASSESSMENT" )}
              onPress={() => navigation.navigate( "DataQualityAssessment", { observationUUID } )}
            />
          )}
        </View>
      </View>
      <Divider />
      {/*
        <View className={sectionClass}>
          <Heading4 className={headingClass}>{t( "PROJECTS" )}</Heading4>
          <Button text={t( "VIEW-PROJECTS" )} />
        </View>
        <Divider />
      */}
      <View className={`${sectionClass} space-y-[11px]`}>
        <Heading4 className={headingClass}>{t( "OTHER-DATA" )}</Heading4>
        <Attribution observation={observation} />
        {application && (
          <Body4>{t( "Uploaded-via-application", { application } )}</Body4>
        )}
        <View><LabelColonValue label="ID" value={String( observation.id )} valueSelectable /></View>
        <View><LabelColonValue label="UUID" value={observation.uuid} valueSelectable /></View>
        <ViewInBrowserButton id={observation.id} />
        <ShareButton id={observation.id} />
      </View>
    </>
  );
};

export default DetailsTab;
