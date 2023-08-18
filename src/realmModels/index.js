import RNFS from "react-native-fs";

import Application from "./Application";
import Comment from "./Comment";
import Flag from "./Flag";
import Identification from "./Identification";
import Observation from "./Observation";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Photo from "./Photo";
import Taxon from "./Taxon";
import User from "./User";
import Vote from "./Vote";

export default {
  schema: [
    Application,
    Comment,
    Flag,
    Identification,
    Observation,
    ObservationPhoto,
    ObservationSound,
    Photo,
    Taxon,
    User,
    Vote
  ],
  schemaVersion: 37,
  path: `${RNFS.DocumentDirectoryPath}/db.realm`,
  migration: ( oldRealm, newRealm ) => {
    if ( oldRealm.schemaVersion < 34 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.observed_on = oldObservation.time_observed_at;
      } );
    }
    if ( oldRealm.schemaVersion < 33 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.comments_viewed = oldObservation.viewed;
        newObservation.identifications_viewed = oldObservation.viewed;
        delete newObservation.viewed;
      } );
    }

    if ( oldRealm.schemaVersion < 32 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.updated_at = oldObservation.created_at;
      } );
    }

    // Apparently you need to migrate when making a property optional
    if ( oldRealm.schemaVersion < 31 ) {
      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );
      oldTaxa.keys( ).forEach( objectIndex => {
        const newTaxon = newTaxa[objectIndex];
        const oldTaxon = oldTaxa[objectIndex];
        if ( oldTaxon.rank_level === 0 ) {
          newTaxon.rank_level = null;
        } else {
          newTaxon.rank_level = oldTaxon.rank_level;
        }
      } );
    }

    if ( oldRealm.schemaVersion < 30 ) {
      const oldUsers = oldRealm.objects( "User" );
      const newUsers = newRealm.objects( "User" );
      // loop through all objects and set the new property in the new schema
      oldUsers.keys( ).forEach( objectIndex => {
        const newUser = newUsers[objectIndex];
        const oldUser = oldUsers[objectIndex];
        newUser.prefers_scientific_name_first = Boolean( oldUser.prefers_scientific_name_first );
        oldUser.prefers_scientific_name_first = Boolean( oldUser.prefers_scientific_name_first );
      } );
    }

    if ( oldRealm.schemaVersion < 29 ) {
      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );

      // loop through all objects and set the new property in the new schema
      oldTaxa.keys( ).forEach( objectIndex => {
        const oldTaxon = oldTaxa[objectIndex];
        const newTaxon = newTaxa[objectIndex];
        newTaxon.rank_level = oldTaxon.rank_level || 0;
        oldTaxon.rank_level = oldTaxon.rank_level || 0;
      } );
    }

    if ( oldRealm.schemaVersion < 21 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );

      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.captive_flag = oldObservation.captive;
      } );
    }
    if ( oldRealm.schemaVersion < 16 ) {
      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );

      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation._synced_at = oldObservation.timeSynced;
        newObservation._updated_at = oldObservation.timeUpdatedLocally;
      } );
    }
    if ( oldRealm.schemaVersion < 3 ) {
      const oldComments = oldRealm.objects( "Comment" );
      const newComments = newRealm.objects( "Comment" );
      // loop through all objects and set the new property in the new schema
      oldComments.keys( ).forEach( objectIndex => {
        const oldComment = oldComments[objectIndex];
        const newComment = newComments[objectIndex];
        newComment.created_at = oldComment.createdAt;
      } );

      const oldIdentifications = oldRealm.objects( "Identification" );
      const newIdentifications = newRealm.objects( "Identification" );
      // loop through all objects and set the new property in the new schema
      oldIdentifications.keys( ).forEach( objectIndex => {
        const oldIdentification = oldIdentifications[objectIndex];
        const newIdentification = newIdentifications[objectIndex];
        newIdentification.created_at = oldIdentification.createdAt;
      } );

      const oldPhotos = oldRealm.objects( "Photo" );
      const newPhotos = newRealm.objects( "Photo" );
      // loop through all objects and set the new property in the new schema
      oldPhotos.keys( ).forEach( objectIndex => {
        const oldPhoto = oldPhotos[objectIndex];
        const newPhoto = newPhotos[objectIndex];
        newPhoto.license_code = oldPhoto.licenseCode;
      } );

      const oldUsers = oldRealm.objects( "User" );
      const newUsers = newRealm.objects( "User" );
      // loop through all objects and set the new property in the new schema
      oldUsers.keys( ).forEach( objectIndex => {
        const oldUser = oldUsers[objectIndex];
        const newUser = newUsers[objectIndex];
        newUser.icon_url = oldUser.iconUrl;
      } );

      const oldTaxa = oldRealm.objects( "Taxon" );
      const newTaxa = newRealm.objects( "Taxon" );
      // loop through all objects and set the new property in the new schema
      oldTaxa.keys( ).forEach( objectIndex => {
        const oldTaxon = oldTaxa[objectIndex];
        const newTaxon = newTaxa[objectIndex];
        newTaxon.preferred_common_name = oldTaxon.preferredCommonName;
        newTaxon.rank_level = null;
      } );

      const oldObservations = oldRealm.objects( "Observation" );
      const newObservations = newRealm.objects( "Observation" );
      // loop through all objects and set the new property in the new schema
      oldObservations.keys( ).forEach( objectIndex => {
        const oldObservation = oldObservations[objectIndex];
        const newObservation = newObservations[objectIndex];
        newObservation.created_at = oldObservation.createdAt;
        newObservation.place_guess = oldObservation.placeGuess;
        newObservation.quality_grade = oldObservation.qualityGrade;
        newObservation.time_observed_at = oldObservation.timeObservedAt;
      } );
    }
  }
};
