// @flow

import _ from "lodash";
import React, {useState, useContext, useEffect} from "react";
import type { Node } from "react";
import { formatISO } from "date-fns";
import { Text, View, Image, Pressable, ScrollView, LogBox, Alert } from "react-native";
import { useTranslation } from "react-i18next";

import ActivityTab from "./ActivityTab";
import checkCamelAndSnakeCase from "./helpers/checkCamelAndSnakeCase";
import createComment from "./helpers/createComment";
import createIdentification from "../Identify/helpers/createIdentification";
import DataTab from "./DataTab";
import faveObservation from "./helpers/faveObservation";
import InputField from "../SharedComponents/InputField";
import ObsDetailsHeader from "./ObsDetailsHeader";
import PhotoScroll from "../SharedComponents/PhotoScroll";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import Taxon from "../../models/Taxon";
import TranslatedText from "../SharedComponents/TranslatedText";
import User from "../../models/User";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObsEditContext } from "../../providers/contexts";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRemoteObservation } from "./hooks/useRemoteObservation";
import { viewStyles, textStyles, imageStyles } from "../../styles/obsDetails/obsDetails";
import { formatObsListTime } from "../../sharedHelpers/dateAndTime";
import { getUser } from "../LoginSignUp/AuthenticationService";
import {colors} from "../../styles/global";
import {Button} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import QualityBadge from "../SharedComponents/QualityBadge";

// this is getting triggered by passing dates, like _created_at, through
// react navigation via the observation object. it doesn't seem to
// actually be breaking anything, for the moment (May 2, 2022)
LogBox.ignoreLogs( [
  "Non-serializable values were found in the navigation state"
] );

const ObsDetails = ( ): Node => {
  const { t } = useTranslation( );
  const [refetch, setRefetch] = useState( false );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );
  const { addObservations } = useContext( ObsEditContext );
  const { params } = useRoute( );
  let observation = params.observation;
  const [tab, setTab] = useState( 0 );
  const navigation = useNavigation( );
  const [ids, setIds] = useState( [] );

  // TODO: we'll probably need to redo this logic a bit now that we're
  // passing an observation via navigation instead of reopening realm
  const { remoteObservation, currentUserFaved } = useRemoteObservation( observation, refetch );

  if ( remoteObservation && !observation ) {
    observation = remoteObservation;
  }
  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  const toggleRefetch = ( ) => setRefetch( !refetch );

  useEffect( () => {
    if ( observation ) {setIds( observation.identifications.map( i => i ) );}
  }, [observation] );

  if ( !observation ) { return null; }


  const comments = observation.comments.map( c => c );
  const photos = _.compact( observation.observationPhotos.map( op => op.photo ) );
  const user = observation.user;
  const taxon = observation.taxon;
  const uuid = observation.uuid;

  const onIDAdded = async ( identification ) => {
    console.log( "onIDAdded", identification );

    // Add temporary ID to observation.identifications ("ghosted" ID, while we're trying to add it)
    const currentUser = await getUser();
    const newId = {
      body: identification.body,
      taxon: identification.taxon,
      user: {
        id: currentUser?.id,
        login: currentUser?.login,
        signedIn: true
      },
      created_at: formatISO( Date.now() ),
      uuid: identification.uuid,
      vision: false,
      // This tells us to render is ghosted (since it's temporarily visible until getting a response from the server)
      temporary: true
    };
    setIds( [ ...ids, newId ] );

    let error = null;

    try {
      const results = await createIdentification( { observation_id: observation.uuid, taxon_id: newId.taxon.id, body: newId.body } );

      if ( results === 1 ) {
        // Remove ghosted highlighting
        newId.temporary = false;
        setIds( [ ...ids, newId ] );
      } else {
        // Couldn't create ID
        error = t( "Couldnt-create-identification", { error: t( "Unknown-error" ) } );
      }
    } catch ( e ) {
      error = t( "Couldnt-create-identification", { error: e.message } );
    }

    if ( error ) {
      // Remove temporary ID and show error
      setIds( [...ids] );

      Alert.alert(
        "Error",
        error,
        [{ text: t( "OK" ) }],
        {
          cancelable: true
        }
      );
    }
  };

  const navToUserProfile = userId => navigation.navigate( "UserProfile", { userId } );
  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );
  const navToAddID = ( ) => {
    addObservations( [observation] );
    navigation.push( "AddID", { onIDAdded: onIDAdded, goBackOnSave: true } );
  };
  const openCommentBox = ( ) => setShowCommentBox( true );
  const submitComment = async ( ) => {
    const response = await createComment( comment, uuid );
    if ( response ) {
      setRefetch( !refetch );
      setComment( "" );
      setShowCommentBox( false );
    }
  };

  const showTaxon = ( ) => {
    if ( !taxon ) { return <Text>{t( "Unknown-organism" )}</Text>; }
    return (
      <>
       <Image source={Taxon.uri( taxon )} style={viewStyles.imageBackground} />
        <Pressable
          style={viewStyles.obsDetailsColumn}
          onPress={navToTaxonDetails}
          testID={`ObsDetails.taxon.${taxon.id}`}
          accessibilityRole="link"
          accessibilityLabel="go to taxon details"
        >
          <Text style={textStyles.commonNameText}>
            {checkCamelAndSnakeCase( taxon, "preferredCommonName" )}
          </Text>
          <Text style={textStyles.scientificNameText}>{taxon.name}</Text>
        </Pressable>
      </>
    );
  };

  const faveOrUnfave = async ( ) => {
    if ( currentUserFaved ) {
      await faveObservation( uuid, "unfave" );
      setRefetch( !refetch );
    } else {
      await faveObservation( uuid, "fave" );
      setRefetch( !refetch );
    }
  };

  const displayCreatedAt = ( ) => observation.createdAt
    ? observation.createdAt
    : formatObsListTime( observation._created_at );

  return (
    <ViewWithFooter>
      <ObsDetailsHeader observationUUID={uuid} />
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        contentContainerStyle={viewStyles.scrollView}
      >
        <View style={viewStyles.userProfileRow}>
          <Pressable
            style={viewStyles.userProfileRow}
            onPress={( ) => navToUserProfile( user.id )}
            testID="ObsDetails.currentUser"
            accessibilityRole="link"
          >
            <UserIcon uri={User.uri( user )} />
            <Text>{User.userHandle( user )}</Text>
          </Pressable>
          <Text style={textStyles.observedOn}>{displayCreatedAt( )}</Text>
        </View>
        <View style={viewStyles.photoContainer}>
          <PhotoScroll photos={photos} />
          <Button icon={currentUserFaved ? "star-outline" : "star"} onPress={faveOrUnfave} textColor={colors.white} labelStyle={textStyles.favText} style={viewStyles.favButton} />
        </View>
        <View style={viewStyles.row}>
          {showTaxon( )}
          <View>
            <View style={viewStyles.rowWithIcon}>
              <Image
                style={imageStyles.smallIcon}
                source={require( "../../images/ic_id.png" )}
              />
              <Text style={textStyles.idCommentCount}>{observation.identifications.length}</Text>
            </View>
            <View style={viewStyles.rowWithIcon}>
              <Icon name="chat" size={15} color={colors.logInGray} />
              <Text style={textStyles.idCommentCount}>{observation.comments.length}</Text>
            </View>
            <QualityBadge qualityGrade={checkCamelAndSnakeCase( observation, "qualityGrade" )} />
          </View>
        </View>
        <View style={[viewStyles.rowWithIcon, viewStyles.locationContainer]}>
          <IconMaterial name="location-pin" size={15} color={colors.logInGray} />
          <Text style={textStyles.locationText}>
            {checkCamelAndSnakeCase( observation, "placeGuess" )}
          </Text>
        </View>

        <View style={viewStyles.userProfileRow}>
          <Pressable
            onPress={showActivityTab}
            accessibilityRole="button"
            style={[viewStyles.tabContainer, tab === 0 ? viewStyles.tabContainerActive : null]}
          >
            <TranslatedText style={[textStyles.tabText, tab === 0 ? textStyles.tabTextActive : null]} text="ACTIVITY" />
          </Pressable>
          <Pressable
            onPress={showDataTab}
            testID="ObsDetails.DataTab"
            accessibilityRole="button"
            style={[viewStyles.tabContainer, tab === 1 ? viewStyles.tabContainerActive : null]}
          >
            <TranslatedText style={[textStyles.tabText, tab === 1 ? textStyles.tabTextActive : null]} text="DATA" />
          </Pressable>
        </View>
        {tab === 0
          ? (
            <ActivityTab
              ids={ids}
              comments={comments}
              navToTaxonDetails={navToTaxonDetails}
              navToUserProfile={navToUserProfile}
              toggleRefetch={toggleRefetch}
            />
          )
          : <DataTab observation={observation} />}
          <View style={viewStyles.row}>
          <View style={viewStyles.button}>
            {/* TODO: get this button working. Not sure why createIdentification isn't working here
            but it doesn't appear to be working on staging either (Mar 11, 2022) */}
            <RoundGreenButton
              buttonText="Suggest an ID"
              handlePress={navToAddID}
              testID="ObsDetail.cvSuggestionsButton"
            />
          </View>
          <View style={viewStyles.button}>
            <RoundGreenButton
              buttonText="Comment"
              handlePress={openCommentBox}
              testID="ObsDetail.commentButton"
            />
          </View>
        </View>
        {showCommentBox && (
          <View style={viewStyles.hoverCommentBox}>
            <InputField
              handleTextChange={setComment}
              placeholder="Add a comment"
              text={comment}
              type="none"
            />
            <RoundGreenButton
              buttonText="Submit comment"
              handlePress={submitComment}
              testID="ObsDetail.commentSubmitButton"
            />
          </View>
        )}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
