// @flow

import {
  Body1,
  Body2,
  Heading4,
  ScrollViewWrapper,
  Tabs,
  ViewWrapper
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { getBuildNumber, getVersion } from "react-native-device-info";

const aboutID = "about";
const teamID = "team";

const About = (): Node => {
  const [activeTab, setActiveTab] = useState( aboutID );
  const appVersion = getVersion();
  const buildVersion = getBuildNumber();

  return (
    <ViewWrapper>
      <Tabs
        tabs={[
          {
            id: aboutID,
            text: t( "ABOUT" ),
            onPress: () => {
              setActiveTab( aboutID );
            }
          },
          {
            id: teamID,
            text: t( "TEAM" ),
            onPress: () => {
              setActiveTab( teamID );
            }
          }
        ]}
        activeId={activeTab}
      />

          <Heading4 className="mb-3">
            {t( "INATURALIST-MISSION-VISION" )}
          </Heading4>
          <Body2 className="mb-5">
            {t( "iNaturalist-mission-is-to-connect" )}
          </Body2>
          <Body2 className="mb-5">{t( "iNaturalist-vision-is-a-world" )}</Body2>
          <Heading4 className="mb-3">{t( "WHAT-IS-INATURALIST" )}</Heading4>
          <Body2 className="mb-5">{t( "iNaturalist-helps-you-identify" )}</Body2>
          <Body2 className="mb-5">{t( "Whats-more-by-recording" )}</Body2>
          <Body2 className="mb-5">{t( "iNaturalist-is-supported-by" )}</Body2>

          <View className="mb-8 items-center justify-center">
            <Body1>{`Version ${appVersion} (${buildVersion})`}</Body1>
      <ScrollViewWrapper>
        {activeTab === aboutID && (
          <View className="px-4 py-8">
          </View>
        )}
        {activeTab === teamID && (
          </View>
          <Heading4 className="mb-3">{t( "INATURALIST-TEAM" )}</Heading4>
          <Body2 className="mb-5">
            {t( "iNaturalists-apps-are-designed-and-developed" )}
          </Body2>
          <Heading4 className="mb-3">{t( "INATURALIST-COMMUNITY" )}</Heading4>
          <Body2 className="mb-5">
            {t( "iNaturalist-is-supported-by-community" )}
          </Body2>
          <Heading4 className="mb-3">{t( "INATURALIST-NETWORK" )}</Heading4>
          <Body2 className="mb-5">{t( "The-iNaturalist-Network" )}</Body2>
          <Heading4 className="mb-3">{t( "COLLABORATORS" )}</Heading4>
          <Body2 className="mb-5">
            {t( "The-iNaturalist-team-has-collaborated" )}
          </Body2>
        )}
      </ScrollViewWrapper>
    </ViewWrapper>
  );
};

export default About;
