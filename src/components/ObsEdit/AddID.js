// @flow

import {
  BottomSheetModal
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import {
  FlatList,
  TextInput as NativeTextInput,
  TouchableOpacity
} from "react-native";
import {
  Button,
  Headline,
  IconButton,
  TextInput,
  useTheme
} from "react-native-paper";
import uuid from "react-native-uuid";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/obsDetails/addID";
import colors from "styles/tailwindColors";

type Props = {
  route: {
    params: {
      onIDAdded: ( identification: { [string]: any } ) => void,
      goBackOnSave: boolean,
      hideComment: boolean,
      clearSearch: boolean
    },
  },
};

const SearchTaxonIcon = (
  <TextInput.Icon
    name={() => (
      <IconMaterial
        style={textStyles.taxonSearchIcon}
        name="search"
        size={25}
      />
    )}
    accessibilityElementsHidden
  />
);

const AddID = ( { route }: Props ): Node => {
  const theme = useTheme();
  const [comment, setComment] = useState( "" );
  const [commentDraft, setCommentDraft] = useState( "" );
  const { onIDAdded, goBackOnSave, hideComment } = route.params;
  const bottomSheetModalRef = useRef( null );
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonSearch],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonSearch,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );

  useEffect( ( ) => {
    // this clears search whenever a user is coming from ObsEdit
    // but maintains current search when a user navigates to TaxonDetails and back
    if ( route?.params?.clearSearch ) {
      setTaxonSearch( "" );
    }
  }, [route] );

  const navigation = useNavigation();

  const renderBackdrop = props => (
    <BottomSheetStandardBackdrop props={props} />
  );

  const editComment = useCallback( () => {
    setCommentDraft( comment );
    bottomSheetModalRef.current?.present();
  }, [comment] );

  const createPhoto = photo => ( {
    id: photo.id,
    url: photo.square_url
  } );

  const createIdentification = taxon => {
    const newTaxon = {
      ...taxon,
      default_photo: taxon.default_photo
        ? createPhoto( taxon.default_photo )
        : null
    };
    const newIdent = {
      uuid: uuid.v4(),
      body: comment,
      taxon: newTaxon
    };

    return newIdent;
  };

  const renderTaxonResult = ( { item: taxon } ) => {
    const taxonImage = taxon.default_photo
      ? { uri: taxon.default_photo.square_url }
      : IconMaterial.getImageSourceSync( "spa", 50, theme.colors.secondary );

    return (
      <View
        className="flex-row my-1 items-center justify-between"
        testID={`Search.taxa.${taxon.id}`}
      >
        <Pressable
          className="flex-row items-center w-16 grow"
          onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
          accessible
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
          accessibilityValue={{ text: taxon.name }}
          accessibilityState={{ disabled: false }}
        >
          <Image
            className="w-12 h-12 mr-1 bg-lightGray"
            source={taxonImage}
            testID={`Search.taxa.${taxon.id}.photo`}
          />
          <View className="shrink">
            <Text>{taxon.name}</Text>
            <Text>{taxon.preferred_common_name}</Text>
          </View>
        </Pressable>
        <View className="flex-row">
          <IconButton
            icon="pencil"
            size={25}
            onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
            accessibilityRole="link"
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
            accessibilityState={{ disabled: false }}
          />
          <IconButton
            icon="checkmark"
            size={25}
            iconColor={theme.colors.secondary}
            onPress={() => {
              onIDAdded( createIdentification( taxon ) );
              if ( goBackOnSave ) {
                navigation.goBack();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t( "Add-this-ID" )}
            accessibilityState={{ disabled: false }}
          />
        </View>
      </View>
    );
  };

  const showEditComment = !hideComment && comment.length === 0;

  useEffect( () => {
    const editCommentIcon = () => (
      <IconButton
        icon="add-comment-outline"
        onPress={editComment}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t( "Edit-comment" )}
        accessibilityState={{ disabled: false }}
      />
    );

    if ( showEditComment ) {
      navigation.setOptions( {
        headerRight: editCommentIcon
      } );
    }
  }, [showEditComment, editComment, navigation] );

  return (
    <ViewWrapper>
      <View className="p-3">
        {comment.length > 0 && (
          <View>
            <Text>{t( "ID-Comment" )}</Text>
            <View style={viewStyles.commentContainer}>
              <IconMaterial
                style={textStyles.commentLeftIcon}
                name="textsms"
                size={25}
              />
              <Text style={textStyles.comment}>{comment}</Text>
              <Pressable
                style={viewStyles.commentRightIconContainer}
                onPress={editComment}
                accessible
                accessibilityRole="link"
                accessibilityLabel={t( "Edit-comment" )}
                accessibilityState={{ disabled: false }}
              >
                <IconMaterial
                  style={textStyles.commentRightIcon}
                  name="edit"
                  size={25}
                />
              </Pressable>
            </View>
          </View>
        )}
        <Text className="color-darkGray">
          {t( "Search-for-a-taxon-to-add-an-identification" )}
        </Text>
        <TextInput
          testID="SearchTaxon"
          left={SearchTaxonIcon}
          style={viewStyles.taxonSearch}
          value={taxonSearch}
          onChangeText={setTaxonSearch}
          selectionColor={theme.colors.tertiary}
          accessible
          accessibilityLabel={t(
            "Search-for-a-taxon-to-add-an-identification"
          )}
          accessibilityRole="search"
          accessibilityState={{ disabled: false }}
        />
        <FlatList
          keyboardShouldPersistTaps="always"
          data={taxonList}
          renderItem={renderTaxonResult}
          keyExtractor={item => item.id}
        />
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableOverDrag={false}
        enablePanDownToClose={false}
        snapPoints={["50%"]}
        backdropComponent={renderBackdrop}
        style={viewStyles.bottomModal}
        accessibilityState={{ disabled: false }}
      >
        <Headline style={textStyles.commentHeader}>
          {comment.length > 0 ? t( "Edit-comment" ) : t( "Add-optional-comment" )}
        </Headline>
        <View style={viewStyles.commentInputContainer}>
          <TextInput
            keyboardType="default"
            style={viewStyles.commentInput}
            value={commentDraft}
            selectionColor={theme.colors.tertiary}
            activeUnderlineColor={theme.colors.background}
            autoFocus
            multiline
            onChangeText={setCommentDraft}
            render={innerProps => (
              <NativeTextInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...innerProps}
                style={[innerProps.style, viewStyles.commentInputText]}
              />
            )}
            accessible
            accessibilityLabel={t( "Add-optional-comment" )}
            accessibilityState={{ disabled: false }}
          />
          <TouchableOpacity
            style={viewStyles.commentClear}
            disabled={commentDraft.length === 0}
            onPress={() => setCommentDraft( "" )}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t( "Clear-comment" )}
            accessibilityState={{ disabled: commentDraft.length === 0 }}
          >
            <Text
              style={[
                viewStyles.commentClearText,
                commentDraft.length === 0 ? textStyles.disabled : null
              ]}
            >
              {t( "Clear" )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={viewStyles.commentButtonContainer}>
          <Button
            style={viewStyles.commentButton}
            uppercase={false}
            color={colors.lightGray}
            onPress={() => {
              bottomSheetModalRef.current?.dismiss();
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t( "Cancel-comment" )}
            accessibilityState={{ disabled: false }}
          >
            {t( "Cancel" )}
          </Button>
          <Button
            style={viewStyles.commentButton}
            uppercase={false}
            disabled={commentDraft.length === 0}
            color={colors.lightGray}
            mode="contained"
            onPress={() => {
              setComment( commentDraft );
              bottomSheetModalRef.current?.dismiss();
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t( "Save-comment" )}
            accessibilityState={{ disabled: commentDraft.length === 0 }}
          >
            {comment.length > 0 ? t( "Edit-comment" ) : t( "Add-comment" )}
          </Button>
        </View>
      </BottomSheetModal>
    </ViewWrapper>
  );
};

export default AddID;
