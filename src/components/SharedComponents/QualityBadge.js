// @flow

import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";

type Props = {
  qualityGrade: ?string,
}

const QualityBadge = ( { qualityGrade }: Props ): React.Node => (
  <View className="bg-primary">
    <Text className="text-white m-1">
      {t( `Quality-Grade-Badge-${qualityGrade ? qualityGrade.replace( "_", "_" ) : ""}` )}
    </Text>
  </View>
);

export default QualityBadge;
