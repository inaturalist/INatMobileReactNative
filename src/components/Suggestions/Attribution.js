// @flow

import {
  Body3
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

import useObservers from "./hooks/useObservers";

type Props = {
  taxonIds: Array<number>
};

const Attribution = ( {
  taxonIds
}: Props ): Node => {
  const { t } = useTranslation( );

  const observers = useObservers( taxonIds );

  if ( !observers || observers?.length === 0 ) {
    return <View testID="Attribution.empty" />;
  }

  return (
    <Body3 className="mt-6 mb-4 mx-4">
      {t( "iNaturalist-Identification-suggestions-are-trained-on", {
        user1: observers[0],
        user2: observers[1],
        user3: observers[2]
      } )}
    </Body3>
  );
};

export default Attribution;
