// @flow

import { searchObservations } from "api/observations";
import classnames from "classnames";
import {
  BottomSheet,
  Button,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "react-native-paper";
import {
  useAuthenticatedQuery, useTranslation
} from "sharedHooks";

import Header from "./Header/Header";
import IdentifiersView from "./IdentifiersView";
import FilterModal from "./Modals/FilterModal";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

type Props = {
  changeExploreView: Function,
  exploreAPIParams: Object,
  exploreView: string,
  isOnline: boolean,
  region: Object,
  updateTaxon: Function,
  updatePlace: Function,
  showFiltersModal: boolean,
  openFiltersModal: Function,
  closeFiltersModal: Function,
}

const Explore = ( {
  changeExploreView,
  exploreAPIParams,
  exploreView,
  isOnline,
  region,
  updateTaxon,
  updatePlace,
  showFiltersModal,
  openFiltersModal,
  closeFiltersModal
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );
  const [observationsView, setObservationsView] = useState( "list" );

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount
    } );
  }, [count] );

  const exploreViewText = {
    observations: t( "OBSERVATIONS" ),
    species: t( "SPECIES" ),
    observers: t( "OBSERVERS" ),
    identifiers: t( "IDENTIFIERS" )
  };

  // TODO: observers and identifiers icons need replacement
  const exploreViewIcon = {
    observations: "binoculars",
    species: "leaf",
    observers: "person",
    identifiers: "person"
  };

  const queryParams = {
    ...exploreAPIParams,
    per_page: 20
  };
  delete queryParams.taxon_name;

  const paramsTotalResults = {
    ...exploreAPIParams,
    per_page: 0
  };

  // 011224 amanda - we might eventually want to fetch this from useInfiniteObservationsScroll
  // instead of making a separate query, but per_page = 0 should make this extra query a low
  // performance cost
  const { data } = useAuthenticatedQuery(
    ["searchObservations"],
    optsWithAuth => searchObservations( paramsTotalResults, optsWithAuth )
  );

  useEffect( ( ) => {
    if ( data?.total_results && count.observations !== data?.total_results ) {
      updateCount( { observations: data?.total_results } );
    }
  }, [data?.total_results, updateCount, count] );

  const renderHeader = ( ) => (
    <Header
      count={count[exploreView]}
      exploreView={exploreView}
      exploreViewIcon={exploreViewIcon[exploreView]}
      updatePlace={updatePlace}
      updateTaxon={updateTaxon}
      openFiltersModal={openFiltersModal}
    />
  );

  const grayCircleClass = "bg-darkGray rounded-full h-[55px] w-[55px]";

  return (
    <>
      {!showFiltersModal
        ? (
          <ViewWrapper testID="Explore">
            {renderHeader()}
            {exploreView === "observations" && (
              <ObservationsViewBar
                observationsView={observationsView}
                updateObservationsView={newView => setObservationsView( newView )}
              />
            )}
            <INatIconButton
              icon={exploreViewIcon[exploreView]}
              color={theme.colors.onPrimary}
              size={27}
              className={classnames(
                grayCircleClass,
                "absolute bottom-5 z-10 right-5"
              )}
              accessibilityLabel={t( "Explore-View" )}
              onPress={() => setShowExploreBottomSheet( true )}
            />
            {exploreView === "observations" && (
              <ObservationsView
                exploreAPIParams={exploreAPIParams}
                observationsView={observationsView}
                region={region}
              />
            )}
            {exploreView === "species" && (
              <SpeciesView
                count={count}
                isOnline={isOnline}
                queryParams={queryParams}
                updateCount={updateCount}
              />
            )}
            {exploreView === "observers" && (
              <ObserversView
                count={count}
                isOnline={isOnline}
                queryParams={queryParams}
                updateCount={updateCount}
              />
            )}
            {exploreView === "identifiers" && (
              <IdentifiersView
                count={count}
                isOnline={isOnline}
                queryParams={queryParams}
                updateCount={updateCount}
              />
            )}
          </ViewWrapper>
        )
        : (
          <ViewWrapper>
            <FilterModal
              closeModal={closeFiltersModal}
              updateTaxon={updateTaxon}
            />
          </ViewWrapper>
        )}
      {showExploreBottomSheet && (
        <BottomSheet headerText={t( "EXPLORE" )}>
          {Object.keys( exploreViewText ).map( view => (
            <Button
              text={exploreViewText[view]}
              key={exploreViewText[view]}
              className="mx-5 my-3"
              onPress={() => {
                changeExploreView( view );
                setShowExploreBottomSheet( false );
              }}
            />
          ) )}
        </BottomSheet>
      )}
    </>
  );
};

export default Explore;
