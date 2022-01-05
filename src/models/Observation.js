import Comment from "./Comment";
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import Taxon from "./Taxon";
import User from "./User";

class Observation {
  static copyRealmSchema( obs ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        if ( createFunction === Identification ) {
          // this one requires special treatment for appending taxon objects
          return createFunction.copyRealmSchema( item );
        }
        return createFunction.mapApiToRealm( item );
      } );
    };

    const taxon = Taxon.copyRealmSchema( obs.taxon );
    const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
    const comments = createLinkedObjects( obs.comments, Comment );
    const identifications = createLinkedObjects( obs.identifications, Identification );
    const user = User.mapApiToRealm( obs.user );

    return {
      ...obs,
      comments: comments || [],
      createdAt: obs.created_at,
      identifications: identifications || [],
      latitude: obs.geojson ? obs.geojson.coordinates[1] : null,
      longitude: obs.geojson ? obs.geojson.coordinates[0] : null,
      observationPhotos,
      placeGuess: obs.place_guess,
      qualityGrade: obs.quality_grade,
      taxon,
      timeObservedAt: obs.time_observed_at,
      user
    };
  }

  static createObservationForRealm( obs, realm ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        return createFunction.mapApiToRealm( item, realm );
      } );
    };

    const taxon = Taxon.mapApiToRealm( obs.taxon, realm );
    const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
    const comments = createLinkedObjects( obs.comments, Comment );
    const identifications = createLinkedObjects( obs.identifications, Identification );

    const newObs = {
      ...obs,
      comments,
      identifications,
      // obs detail on web says geojson coords are preferred over lat/long
      // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
      latitude: obs.geojson.coordinates[1],
      longitude: obs.geojson.coordinates[0],
      observationPhotos,
      taxon
    };

    // need to append user after the observation realm object has been created
    delete newObs.user;
    return newObs;
  }

  static uri = obs => ( obs && obs.observationPhotos ) && { uri: obs.observationPhotos[0].photo.url };

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      comments: "Comment[]",
      created_at: { type: "string?", mapTo: "createdAt" },
      description: "string?",
      identifications: "Identification[]",
      latitude: "double?",
      longitude: "double?",
      observationPhotos: "ObservationPhoto[]",
      place_guess: { type: "string?", mapTo: "placeGuess" },
      quality_grade: { type: "string?", mapTo: "qualityGrade" },
      taxon: "Taxon?",
      time_observed_at: { type: "string?", mapTo: "timeObservedAt" },
      user: "User?"
    }
  }
}

export default Observation;
