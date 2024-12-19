// @flow

import {
  Heading3
  // LabelColonValue
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import DQAButton from "./DQAButton";
import ProjectButton from "./ProjectButton";
import ShareButton from "./ShareButton";
import ViewInBrowserButton from "./ViewInBrowserButton";

type Props = {
  observation: Object
}

const MoreSection = ( { observation }: Props ): Node => {
  const observationUUID = observation?.uuid;

  if ( !observation ) return null;

  return (
    <View className="m-4 pb-4">
      <Heading3 className="mt-5 mb-1">{t( "More" )}</Heading3>
      <ProjectButton observation={observation} />
      <DQAButton observationUUID={observationUUID} />
      <ViewInBrowserButton id={observation.id} />
      <ShareButton id={observation.id} />
      {/* <View className="mt-[11px]">
        <LabelColonValue label="ID" value={String( observation.id )} valueSelectable />
      </View>
      <View className="mt-[11px]">
        <LabelColonValue label="UUID" value={observation.uuid} valueSelectable />
      </View> */}
    </View>
  );
};

export default MoreSection;
