// @flow
import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  observation: Object,
  classNameMargin?: string
};

const ObservationLocation = ( { observation, classNameMargin }: Props ): React.Node => {
  const { t } = useTranslation( );

  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  if (
    !displayLocation
    && ( observation?.latitude !== null && observation?.latitude !== undefined )
    && ( observation?.longitude != null && observation?.longitude !== undefined )
  ) {
    displayLocation = `${observation.latitude}, ${observation.longitude}`;
  } else if ( !displayLocation ) {
    displayLocation = t( "Missing-Location" );
  }

  return (
    <View
      className={classNames( "flex flex-row items-center", classNameMargin )}
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
    >
      <INatIcon name="location" size={13} />
      <Body4
        className="text-darkGray ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {displayLocation}
      </Body4>
    </View>
  );
};

export default ObservationLocation;
