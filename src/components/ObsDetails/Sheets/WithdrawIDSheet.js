// @flow
import {
  BottomSheet,
  Button,
  DisplayTaxon
} from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

    type Props = {
      handleClose: Function,
      withdrawOrRestoreIdentification: Function,
      taxon: Object
    }

const showTaxon = taxon => {
  if ( !taxon ) {
    return <Text>{t( "Unknown-organism" )}</Text>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <DisplayTaxon taxon={taxon} />
    </View>
  );
};

const WithdrawIDSheet = ( {
  handleClose,
  withdrawOrRestoreIdentification,
  taxon
}: Props ): Node => (
  <BottomSheet
    handleClose={handleClose}
    headerText={t( "WITHDRAW-ID-QUESTION" )}
    snapPoints={[220]}
  >
    <View
      className="mx-[26px] space-y-[11px] my-[15px]"
    >
      {showTaxon( taxon )}
    </View>
    <View className="flex-row justify-evenly mx-3">
      <Button
        text={t( "CANCEL" )}
        onPress={( ) => {
          handleClose();
        }}
        className="mx-2"
        testID="ObsDetail.WithdrawId.cancel"
        accessibilityRole="button"
        accessibilityHint={t( "Closes-withdraw-id-sheet" )}
        level="secondary"
      />
      <Button
        text={t( "WITHDRAW-ID" )}
        onPress={( ) => {
          withdrawOrRestoreIdentification( false );
          handleClose();
        }}
        className="mx-2 grow"
        testID="ObsDetail.WithdrawId.withdraw"
        accessibilityRole="button"
        accessibilityHint={t( "Withdraws-id-and-closes" )}
        level="primary"
      />

    </View>
  </BottomSheet>
);

export default WithdrawIDSheet;
