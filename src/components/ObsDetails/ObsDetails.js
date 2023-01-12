// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { createComment } from "api/comments";
import {
  faveObservation, fetchRemoteObservation, markObservationUpdatesViewed, unfaveObservation
} from "api/observations";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import QualityBadge from "components/SharedComponents/QualityBadge";
import ScrollWithFooter from "components/SharedComponents/ScrollWithFooter";
import UserIcon from "components/SharedComponents/UserIcon";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { formatISO } from "date-fns";
import { t } from "i18next";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useEffect,
  useState
} from "react";
import {
  Alert,
  LogBox
} from "react-native";
import { ActivityIndicator, Button as IconButton } from "react-native-paper";
import createUUID from "react-native-uuid";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Observation from "realmModels/Observation";
import Taxon from "realmModels/Taxon";
import User from "realmModels/User";
import { formatObsListTime } from "sharedHelpers/dateAndTime";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIsOnline from "sharedHooks/useIsOnline";
import useLocalObservation from "sharedHooks/useLocalObservation";
import { imageStyles } from "styles/obsDetails/obsDetails";
import colors from "styles/tailwindColors";

import ActivityTab from "./ActivityTab";
import AddCommentModal from "./AddCommentModal";
import DataTab from "./DataTab";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";

const { useRealm } = RealmContext;

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ObsDetails = ( ): Node => {
  const isOnline = useIsOnline( );
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const [refetch, setRefetch] = useState( false );
  const { params } = useRoute( );
  const { uuid } = params;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );
  const realm = useRealm( );
  const localObservation = useLocalObservation( uuid );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [addingComment, setAddingComment] = useState( false );
  const [comments, setComments] = useState( [] );

  const queryClient = useQueryClient( );

  const remoteObservationParams = {
    fields: Observation.FIELDS
  };

  const {
    data: remoteObservation,
    refetch: refetchRemoteObservation
  } = useAuthenticatedQuery(
    ["fetchRemoteObservation", uuid],
    optsWithAuth => fetchRemoteObservation( uuid, remoteObservationParams, optsWithAuth )
  );

  const observation = localObservation || remoteObservation;

  const markViewedLocally = async ( ) => {
    realm?.write( ( ) => {
      localObservation.viewed = true;
    } );
  };

  const markViewedMutation = useAuthenticatedMutation(
    ( viewedParams, optsWithAuth ) => markObservationUpdatesViewed( viewedParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        markViewedLocally( );
        queryClient.invalidateQueries( ["fetchRemoteObservation", uuid] );
        refetchRemoteObservation( );
      }
    }
  );

  const taxon = observation?.taxon;
  const user = observation?.user;
  const faves = observation?.faves;
  const observationPhotos = observation?.observationPhotos || observation?.observation_photos;
  const currentUserFaved = faves?.length > 0 ? faves.find( fave => fave.user.id === userId ) : null;

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );
  const showErrorAlert = error => Alert.alert(
    "Error",
    error,
    [{ text: t( "OK" ) }],
    {
      cancelable: true
    }
  );

  const toggleRefetch = ( ) => setRefetch( !refetch );
  const openCommentBox = ( ) => setShowCommentBox( true );
  const createCommentMutation = useAuthenticatedMutation(
    ( commentParams, optsWithAuth ) => createComment( commentParams, optsWithAuth ),
    {
      onSuccess: data => setComments( [...comments, data[0]] ),
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-comment", { error: e.message } );
        } else {
          error = t( "Couldnt-create-comment", { error: t( "Unknown-error" ) } );
        }

        // Remove temporary comment and show error
        setComments( [...comments] );
        showErrorAlert( error );
      },
      onSettled: ( ) => setAddingComment( false )
    }
  );
  const onCommentAdded = async commentBody => {
    // Add temporary comment to observation.comments ("ghosted" comment,
    // while we're trying to add it)
    const newComment = {
      body: commentBody,
      user: {
        id: userId,
        login: currentUser?.login,
        signedIn: true
      },
      created_at: formatISO( Date.now() ),
      uuid: createUUID.v4( ),
      // This tells us to render is ghosted (since it's temporarily visible
      // until getting a response from the server)
      temporary: true
    };
    setComments( [...comments, newComment] );

    createCommentMutation.mutate( {
      comment: {
        body: commentBody,
        parent_id: uuid,
        parent_type: "Observation"
      }
    } );
  };

  useEffect( ( ) => {
    if ( localObservation && !localObservation?.viewed ) {
      markViewedMutation.mutate( { id: uuid } );
    }
  }, [localObservation, markViewedMutation, uuid] );

  useEffect( ( ) => {
    const obsCreatedLocally = observation?.id === null;
    const obsOwnedByCurrentUser = observation?.user?.id === currentUser?.id;

    const navToObsEdit = ( ) => navigation.navigate( "ObsEdit", { uuid: observation?.uuid } );
    const editIcon = ( ) => ( obsCreatedLocally || obsOwnedByCurrentUser )
    && <IconButton icon="pencil" onPress={navToObsEdit} textColor={colors.gray} />;

    navigation.setOptions( {
      headerRight: editIcon
    } );
  }, [navigation, observation, currentUser] );

  useEffect( ( ) => {
    // set initial comments for activity tab
    const currentComments = observation?.comments;
    if ( currentComments
        && comments.length === 0
        && currentComments.length !== comments.length ) {
      setComments( currentComments );
    }
  }, [observation, comments] );

  if ( !observation ) { return null; }

  const photos = _.compact( Array.from( observationPhotos ).map( op => op.photo ) );

  const navToUserProfile = id => navigation.navigate( "UserProfile", { userId: id } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  const showTaxon = ( ) => {
    if ( !taxon ) { return <Text>{t( "Unknown-organism" )}</Text>; }
    return (
      <View className="flex-row">
        <Image source={Taxon.uri( taxon )} className="w-16 h-16 rounded-xl mr-3" />
        <Pressable
          className="justify-center"
          onPress={navToTaxonDetails}
          testID={`ObsDetails.taxon.${taxon.id}`}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
        >
          <Text>
            {checkCamelAndSnakeCase( taxon, "preferredCommonName" )}
          </Text>
          <Text>{taxon.name}</Text>
        </Pressable>
      </View>
    );
  };

  const faveOrUnfave = async ( ) => {
    // TODO: fix fave/unfave functionality with useMutation
    if ( currentUserFaved ) {
      await unfaveObservation( { uuid } );
      setRefetch( true );
      queryClient.invalidateQueries( ["fetchRemoteObservation"] );
    } else {
      await faveObservation( { uuid } );
      setRefetch( true );
      queryClient.invalidateQueries( ["fetchRemoteObservation"] );
    }
  };

  const displayCreatedAt = ( ) => ( observation?.created_at
    ? formatObsListTime( observation.created_at ) : "" );

  const displayTab = ( handlePress, testID, tabText, active ) => {
    let textClassName = "color-gray text-xl font-bold";

    if ( active ) {
      textClassName += " color-inatGreen";
    }

    return (
      <Pressable
        onPress={handlePress}
        testID={testID}
        accessibilityRole="button"
        className="w-1/2 items-center"
      >
        <Text className={textClassName}>
          {tabText}
        </Text>
        { active && <View className="border border-inatGreen w-full" />}
      </Pressable>
    );
  };
  const displayPhoto = ( ) => {
    if ( !isOnline ) {
      return (
        <View className="bg-white flex-row justify-center">
          <IconMaterial name="network-check" size={100} accessibilityRole="image" />
        </View>
      );
    }
    if ( photos.length > 0 || observation.observationSounds.length > 0 ) {
      return (
        <View className="bg-black">
          <PhotoScroll photos={photos} />
          <IconButton
            icon={currentUserFaved ? "star-outline" : "star"}
            onPress={faveOrUnfave}
            textColor={colors.white}
            className="absolute top-3 right-0"
          />
        </View>
      );
    }
    return (
      <View className="bg-white flex-row justify-center">
        <IconMaterial name="image-not-supported" size={100} />
      </View>
    );
  };

  return (
    <>
      <ScrollWithFooter testID={`ObsDetails.${uuid}`}>
        <View className="flex-row justify-between items-center m-3">
          <Pressable
            className="flex-row items-center"
            onPress={( ) => navToUserProfile( user.id )}
            testID="ObsDetails.currentUser"
            accessibilityRole="link"
          >
            <UserIcon uri={User.uri( user )} small />
            <Text className="ml-3">{User.userHandle( user )}</Text>
          </Pressable>
          <Text className="color-logInGray">{displayCreatedAt( )}</Text>
        </View>
        {displayPhoto()}
        <View className="flex-row my-5 justify-between mx-3">
          {showTaxon( )}
          <View>
            <View className="flex-row my-1">
              <Image
                style={imageStyles.smallIcon}
                source={require( "images/ic_id.png" )}
              />
              <Text className="ml-1">{observation.identifications.length}</Text>
            </View>
            <View className="flex-row my-1">
              <IconMaterial name="chat-bubble" size={15} color={colors.logInGray} />
              <Text className="ml-1">{observation.comments.length}</Text>
            </View>
            <QualityBadge qualityGrade={checkCamelAndSnakeCase( observation, "qualityGrade" )} />
          </View>
        </View>
        <View className="flex-row ml-3">
          <IconMaterial name="location-pin" size={15} color={colors.logInGray} />
          <Text className="color-logInGray ml-2">
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
        </View>
        <View className="flex-row mt-6">
          {displayTab( showActivityTab, "ObsDetails.ActivityTab", t( "ACTIVITY" ), tab === 0 )}
          {displayTab( showDataTab, "ObsDetails.DataTab", t( "DATA" ), tab === 1 )}
        </View>
        {tab === 0
          ? (
            <ActivityTab
              uuid={uuid}
              observation={observation}
              comments={comments}
              navToTaxonDetails={navToTaxonDetails}
              navToUserProfile={navToUserProfile}
              toggleRefetch={toggleRefetch}
              refetchRemoteObservation={refetchRemoteObservation}
              openCommentBox={openCommentBox}
              showCommentBox={showCommentBox}
            />
          )
          : <DataTab observation={observation} />}
        {addingComment && (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
        )}
      </ScrollWithFooter>
      <AddCommentModal
      //  potential to move this modal to ActivityTab and have it handle comments
      //  and ids but there were issues with presenting the modal in a scrollview.
        onCommentAdded={onCommentAdded}
        showCommentBox={showCommentBox}
        setShowCommentBox={setShowCommentBox}
        setAddingComment={setAddingComment}
      />
    </>
  );
};

export default ObsDetails;
