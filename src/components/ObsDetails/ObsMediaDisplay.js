// @flow
import {
  INatIcon,
  PhotoCount
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

import ObsMediaCarousel from "./ObsMediaCarousel";

type Props = {
  photos: Array<Object>,
  sounds: Array<Object>
}

const ObsMediaDisplay = ( {
  photos = [],
  sounds = []
}: Props ): Node => {
  const { t } = useTranslation( );

  const items = [...photos, ...sounds];

  if ( items.length > 0 ) {
    return (
      <View className="bg-black">
        <ObsMediaCarousel
          photos={photos}
          sounds={sounds}
        />
        <View className="absolute bottom-5 left-5">
          <PhotoCount count={items.length} />
        </View>
      </View>
    );
  }

  return (
    <View
      className="bg-black flex-row justify-center items-center h-72"
      accessible
      accessibilityLabel={t( "Observation-has-no-photos-and-no-sounds" )}
    >
      <INatIcon
        name="noevidence"
        size={96}
        color={colors.white}
      />
    </View>
  );
};

export default ObsMediaDisplay;
