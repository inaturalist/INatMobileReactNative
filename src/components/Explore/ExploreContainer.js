// @flow

import { useRoute } from "@react-navigation/native";
import { searchObservations } from "api/observations";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
  SORT_BY,
  useExplore,
  WILD_STATUS
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuthenticatedQuery, useCurrentUser, useIsConnected } from "sharedHooks";

import Explore from "./Explore";

const DELTA = 0.2;

const mapParamsToAPI = ( params, currentUser ) => {
  const RESEARCH = "research";
  const NEEDS_ID = "needs_id";
  const CASUAL = "casual";

  const CREATED_AT = "created_at"; // = date uploaded at
  const OBSERVED_ON = "observed_on";
  const VOTES = "votes";

  const DESC = "desc";
  const ASC = "asc";

  // Remove any params that is falsy
  const filteredParams = Object.entries( params ).reduce(
    ( newParams, [key, value] ) => {
      if ( value ) {
        newParams[key] = value;
      }
      return newParams;
    },
    {}
  );

  // DATE_UPLOADED_NEWEST is the default sort order
  filteredParams.order_by = CREATED_AT;
  filteredParams.order = DESC;
  if ( params.sortBy === SORT_BY.DATE_UPLOADED_OLDEST ) {
    filteredParams.order_by = CREATED_AT;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_NEWEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = DESC;
  }
  if ( params.sortBy === SORT_BY.DATE_OBSERVED_OLDEST ) {
    filteredParams.order_by = OBSERVED_ON;
    filteredParams.order = ASC;
  }
  if ( params.sortBy === SORT_BY.MOST_FAVED ) {
    filteredParams.order_by = VOTES;
    filteredParams.order = DESC;
  }

  filteredParams.quality_grade = [];
  if ( params.researchGrade ) {
    filteredParams.quality_grade.push( RESEARCH );
  }
  if ( params.needsID ) {
    filteredParams.quality_grade.push( NEEDS_ID );
  }
  if ( params.casual ) {
    filteredParams.quality_grade.push( CASUAL );
    delete filteredParams.verifiable;
  }

  if ( filteredParams.months ) {
    filteredParams.month = filteredParams.months;
    delete filteredParams.months;
  }

  // MEDIA.ALL is the default media filter and for it we don't need to pass any params
  if ( params.media === MEDIA.PHOTOS ) {
    filteredParams.photos = true;
  }
  if ( params.media === MEDIA.SOUNDS ) {
    filteredParams.sounds = true;
  }
  if ( params.media === MEDIA.NONE ) {
    filteredParams.photos = false;
    filteredParams.sounds = false;
  }

  if ( params.wildStatus === WILD_STATUS.WILD ) {
    filteredParams.captive = false;
  } else if ( params.wildStatus === WILD_STATUS.CAPTIVE ) {
    filteredParams.captive = true;
  }

  if ( params.reviewedFilter === REVIEWED.REVIEWED ) {
    filteredParams.reviewed = true;
    filteredParams.viewer_id = currentUser?.id;
  } else if ( params.reviewedFilter === REVIEWED.UNREVIEWED ) {
    filteredParams.reviewed = false;
    filteredParams.viewer_id = currentUser?.id;
  }

  if ( params.photoLicense !== PHOTO_LICENSE.ALL ) {
    // How license filter maps to the API
    const licenseParams = {
      [PHOTO_LICENSE.CC0]: "cc0",
      [PHOTO_LICENSE.CCBY]: "cc-by",
      [PHOTO_LICENSE.CCBYNC]: "cc-by-nc",
      [PHOTO_LICENSE.CCBYSA]: "cc-by-sa",
      [PHOTO_LICENSE.CCBYND]: "cc-by-nd",
      [PHOTO_LICENSE.CCBYNCSA]: "cc-by-nc-sa",
      [PHOTO_LICENSE.CCBYNCND]: "cc-by-nc-nd"
    };
    filteredParams.photo_license = licenseParams[params.photoLicense];
  }

  delete filteredParams.taxon;
  delete filteredParams.taxon_name;
  delete filteredParams.place_guess;
  delete filteredParams.user;
  delete filteredParams.project;
  delete filteredParams.sortBy;
  delete filteredParams.researchGrade;
  delete filteredParams.needsID;
  delete filteredParams.casual;
  delete filteredParams.dateObserved;
  delete filteredParams.dateUploaded;
  delete filteredParams.media;
  delete filteredParams.introduced;
  delete filteredParams.native;
  delete filteredParams.endemic;
  delete filteredParams.noStatus;
  delete filteredParams.wildStatus;
  delete filteredParams.reviewedFilter;
  delete filteredParams.photoLicense;

  return filteredParams;
};

const ExploreContainerWithContext = ( ): Node => {
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const currentUser = useCurrentUser();

  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );

  const { state, dispatch, makeSnapshot } = useExplore();

  const [region, setRegion] = useState( {
    latitude: 0.0,
    longitude: 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );
  const [showFiltersModal, setShowFiltersModal] = useState( false );
  const [exploreView, setExploreView] = useState( "observations" );

  useEffect( ( ) => {
    if ( params?.viewSpecies ) {
      setExploreView( "species" );
    }
    if ( params?.worldwide ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
        placeName: ""
      } );
    }
    if ( params?.taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        taxon: params.taxon,
        taxonId: params.taxon?.id,
        taxonName: params.taxon?.preferred_common_name || params.taxon?.name
      } );
    }
    if ( params?.place ) {
      const { coordinates } = params.place.point_geojson;
      setRegion( {
        latitude: coordinates[1],
        longitude: coordinates[0],
        latitudeDelta: DELTA,
        longitudeDelta: DELTA
      } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: params.place?.id,
        placeName: params.place?.display_name
      } );
    }
    if ( params?.user && params?.user.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project && params?.project.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        project: params.project,
        projectId: params.project.id
      } );
    }
  }, [params, dispatch] );

  const changeExploreView = newView => {
    setExploreView( newView );
  };

  const updateTaxon = ( taxon: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.CHANGE_TAXON,
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount
    } );
  }, [count] );

  const filteredParams = mapParamsToAPI(
    state,
    currentUser
  );

  const queryParams = {
    ...filteredParams,
    per_page: 20
  };
  if ( exploreView === "observers" ) {
    queryParams.order_by = "observation_count";
  }
  delete queryParams.taxon_name;

  const paramsTotalResults = {
    ...filteredParams,
    per_page: 0
  };

  // 011224 amanda - we might eventually want to fetch this from useInfiniteObservationsScroll
  // instead of making a separate query, but per_page = 0 should make this extra query a low
  // performance cost
  const { data } = useAuthenticatedQuery(
    ["searchObservations", paramsTotalResults],
    optsWithAuth => searchObservations( paramsTotalResults, optsWithAuth )
  );

  useEffect( ( ) => {
    if ( data?.total_results && count.observations !== data?.total_results ) {
      updateCount( { observations: data?.total_results } );
    }
  }, [data?.total_results, updateCount, count] );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  return (
    <Explore
      changeExploreView={changeExploreView}
      closeFiltersModal={closeFiltersModal}
      count={count}
      exploreView={exploreView}
      isOnline={isOnline}
      openFiltersModal={openFiltersModal}
      queryParams={queryParams}
      region={region}
      showFiltersModal={showFiltersModal}
      updateCount={updateCount}
      updateTaxon={updateTaxon}
    />
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;
