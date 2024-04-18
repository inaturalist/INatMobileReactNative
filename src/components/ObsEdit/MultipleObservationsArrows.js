// @flow

import { Heading2, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  currentObservationIndex: number,
  setCurrentObservationIndex: any,
  observations: Array<any>,
  setResetScreen: any
}

const MultipleObservationsArrows = ( {
  currentObservationIndex,
  setCurrentObservationIndex,
  observations,
  setResetScreen
}: Props ): Node => {
  const { t } = useTranslation( );

  const showNextObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex + 1 );
    setResetScreen( true );
  };
  const showPrevObservation = ( ) => {
    setCurrentObservationIndex( currentObservationIndex - 1 );
    setResetScreen( true );
  };

  return (
    <View className="flex-row items-center justify-between pt-5">
      <View className="w-16">
        {currentObservationIndex !== 0 && (
          <INatIconButton
            icon="chevron-left-circle"
            size={26}
            onPress={showPrevObservation}
            accessibilityLabel={t( "Previous-observation" )}
          />
        )}
      </View>
      <Heading2>
        {t( "X-of-Y", {
          count: currentObservationIndex + 1,
          totalObservationCount: observations.length
        } )}
      </Heading2>
      <View className="w-16">
        {( currentObservationIndex !== observations.length - 1 )
          && (
            <INatIconButton
              icon="chevron-right-circle"
              size={26}
              onPress={showNextObservation}
              accessibilityLabel={t( "Next-observation" )}
            />
          )}
      </View>
    </View>
  );
};

export default MultipleObservationsArrows;
