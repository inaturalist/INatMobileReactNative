// @flow

import {
  TaxonResult
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores";

type Props = {
  accessibilityLabel: string,
  onTaxonChosen: any,
  suggestion: any,
};

const Suggestion = ( {
  accessibilityLabel,
  suggestion,
  onTaxonChosen
}: Props ): Node => (
  <TaxonResult
    accessibilityLabel={accessibilityLabel}
    taxon={suggestion.taxon}
    handleCheckmarkPress={onTaxonChosen}
    testID={`SuggestionsList.taxa.${suggestion?.taxon?.id}`}
    confidence={suggestion?.score
      ? convertOfflineScoreToConfidence( suggestion?.score )
      : convertOnlineScoreToConfidence( suggestion.combined_score )}
    activeColor="bg-inatGreen"
    confidencePosition="text"
    first
  />
);

export default Suggestion;
