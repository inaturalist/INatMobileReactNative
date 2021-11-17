// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";

const USER_FIELDS = {
  icon_url: true,
  id: true,
  login: true,
  name: true
};

const TAXON_FIELDS = {
  default_photo: {
    square_url: true
  },
  iconic_taxon_name: true,
  name: true,
  preferred_common_name: true,
  rank: true,
  rank_level: true
};

const ID_FIELDS = {
  body: true,
  category: true,
  created_at: true,
  current: true,
  disagreement: true,
  taxon: TAXON_FIELDS,
  updated_at: true,
  user: Object.assign( { }, USER_FIELDS, { id: true } ),
  uuid: true,
  vision: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const COMMENT_FIELDS = {
  body: true,
  created_at: true,
  id: true,
  user: USER_FIELDS
};

const FIELDS = {
  comments_count: true,
  comments: COMMENT_FIELDS,
  created_at: true,
  description: true,
  geojson: true,
  identifications: ID_FIELDS,
  latitude: true,
  location: true,
  longitude: true,
  photos: PHOTO_FIELDS,
  place_guess: true,
  quality_grade: true,
  taxon: TAXON_FIELDS,
  time_observed_at: true,
  user: USER_FIELDS
};

const useFetchObservations = ( ): Array<Object> => {
  const [observations, setObservations] = useState( [] );
  const realmRef = useRef( null );
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;

      const localObservations = realm.objects( "Observation" );
      if ( localObservations?.length ) {
        setObservations( localObservations );
      }
      subscriptionRef.current = localObservations;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setObservations] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setObservations( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) { return; }
    const realm = realmRef.current;
    results.forEach( obs => {
      const newObs = Observation.createObservationForRealm( obs );
      realm?.write( ( ) => {
        const existingObs = realm.objects( "Observation" ).filtered( `uuid = '${obs.uuid}'` );
        if ( existingObs.length > 0 ) {
          return;
        }
        realm?.create( "Observation", newObs );
      } );
    } );
}, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 100,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations:", e.message, );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [writeToDatabase] );

  return observations;
};

export default useFetchObservations;
