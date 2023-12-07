// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body3, Button, ScrollViewWrapper
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  ActivityIndicator
} from "react-native-paper";
import { useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import Attribution from "./Attribution";
import CommentBox from "./CommentBox";
import PhotoSelectionList from "./PhotoSelectionList";
import SuggestionsList from "./SuggestionsList";

type Props = {
  comment: string,
  currentObservation: Object,
  loading: boolean,
  loadingSuggestions: boolean,
  nearbySuggestions: Array<Object>,
  onTaxonChosen: Function,
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function
};

const Suggestions = ( {
  comment,
  currentObservation,
  loading,
  loadingSuggestions,
  nearbySuggestions,
  onTaxonChosen,
  photoUris,
  selectedPhotoUri,
  setSelectedPhotoUri
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const obsUUID = params?.obsUUID;

  return (
    <ScrollViewWrapper testID="suggestions">
      <AddCommentPrompt
        currentObservation={currentObservation}
      />
      {loading && (
        <View
          className="absolute self-center z-10 pt-[30px]"
          testID="Suggestions.ActivityIndicator"
        >
          <ActivityIndicator large />
        </View>
      )}
      <View className="mx-5">
        <PhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          setSelectedPhotoUri={setSelectedPhotoUri}
        />
        <Body3 className="my-4 mx-3">{t( "Select-the-identification-you-want-to-add" )}</Body3>
        <Button
          text={t( "SEARCH-FOR-A-TAXON" )}
          onPress={( ) => navigation.navigate(
            "TaxonSearch",
            { obsUUID }
          )}
          accessibilityLabel={t( "Search" )}
        />
      </View>
      <CommentBox comment={comment} />
      <SuggestionsList
        nearbySuggestions={nearbySuggestions}
        onTaxonChosen={onTaxonChosen}
        loadingSuggestions={loadingSuggestions}
      />
      {nearbySuggestions?.length > 0 && (
        <Attribution
          taxonIds={nearbySuggestions.map(
            suggestion => suggestion.taxon.id
          )}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default Suggestions;
