import Application from "./Application";
import Comment from "./Comment";
import Identification from "./Identification";
import Observation from "./Observation";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Photo from "./Photo";
import Taxon from "./Taxon";
import User from "./User";

export default {
  schema: [
    Application,
    Comment,
    Identification,
    Observation,
    ObservationPhoto,
    ObservationSound,
    Photo,
    Taxon,
    User
  ],
  schemaVersion: 28,
  path: "db.realm",
  migration: ( oldRealm, newRealm ) => {
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
