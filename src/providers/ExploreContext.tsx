import * as React from "react";

export enum EXPLORE_ACTION {
  DISCARD = "DISCARD",
  RESET = "RESET",
  CHANGE_TAXON = "CHANGE_TAXON",
  SET_TAXON_NAME = "SET_TAXON_NAME",
  SET_PLACE = "SET_PLACE",
  SET_USER = "SET_USER",
  SET_PROJECT = "SET_PROJECT",
  CHANGE_SORT_BY = "CHANGE_SORT_BY",
  TOGGLE_RESEARCH_GRADE = "TOGGLE_RESEARCH_GRADE",
  TOGGLE_NEEDS_ID = "TOGGLE_NEEDS_ID",
  TOGGLE_CASUAL = "TOGGLE_CASUAL",
  SET_HIGHEST_TAXONOMIC_RANK = "SET_HIGHEST_TAXONOMIC_RANK",
  SET_LOWEST_TAXONOMIC_RANK = "SET_LOWEST_TAXONOMIC_RANK",
  SET_DATE_OBSERVED_MONTHS = "SET_DATE_OBSERVED_MONTHS",
  SET_DATE_OBSERVED_EXACT = "SET_DATE_OBSERVED_EXACT",
  SET_DATE_OBSERVED_ALL = "SET_DATE_OBSERVED_ALL",
  SET_DATE_UPLOADED_EXACT = "SET_DATE_UPLOADED_EXACT",
  SET_DATE_UPLOADED_ALL = "SET_DATE_UPLOADED_ALL",
  SET_MEDIA = "SET_MEDIA",
  TOGGLE_NO_STATUS = "TOGGLE_NO_STATUS",
  TOGGLE_ENDEMIC = "TOGGLE_ENDEMIC",
  TOGGLE_NATIVE = "TOGGLE_NATIVE",
  TOGGLE_INTRODUCED = "TOGGLE_INTRODUCED",
  SET_WILD_STATUS = "SET_WILD_STATUS",
  SET_REVIEWED = "SET_REVIEWED",
  SET_PHOTO_LICENSE = "SET_PHOTO_LICENSE"
}

export enum SORT_BY {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED",
}

// TODO: this should be imported from a central point, e.g. Taxon realm model
// TODO: this is probably against conventioins to make it in lower case but I (Johannes) don't want to have to add another object somewhere else to map them to the values the API accepts
export enum TAXONOMIC_RANK {
    kingdom = "kingdom",
    phylum = "phylum",
    subphylum = "subphylum",
    superclass = "superclass",
    class = "class",
    subclass = "subclass",
    infraclass = "infraclass",
    subterclass = "subterclass",
    superorder = "superorder",
    order = "order",
    suborder = "suborder",
    infraorder = "infraorder",
    parvorder = "parvorder",
    zoosection = "zoosection",
    zoosubsection = "zoosubsection",
    superfamily = "superfamily",
    epifamily = "epifamily",
    family = "family",
    subfamily = "subfamily",
    supertribe = "supertribe",
    tribe = "tribe",
    subtribe = "subtribe",
    genus = "genus",
    genushybrid = "genushybrid",
    subgenus = "subgenus",
    section = "section",
    subsection = "subsection",
    complex = "complex",
    species = "species",
    hybrid = "hybrid",
    subspecies = "subspecies",
    variety = "variety",
    form = "form",
    infrahybrid = "infrahybrid",
  }

export enum DATE_OBSERVED {
  ALL = "ALL",
  EXACT_DATE = "EXACT_DATE",
  MONTHS = "MONTHS",
}

export enum DATE_UPLOADED {
  ALL = "ALL",
  EXACT_DATE = "EXACT_DATE",
}

export enum MEDIA {
  ALL = "ALL",
  PHOTOS = "PHOTOS",
  SOUNDS = "SOUNDS",
  NONE = "NONE"
}

export enum WILD_STATUS {
  ALL = "ALL",
  WILD = "WILD",
  CAPTIVE = "CAPTIVE"
}

export enum REVIEWED {
  ALL = "ALL",
  REVIEWED = "REVIEWED",
  UNREVIEWED = "UNREVIEWED"
}

export enum PHOTO_LICENSE {
  ALL = "ALL",
  CC0 = "CC0",
  CCBY = "CCBY",
  CCBYNC = "CCBYNC",
  CCBYSA = "CCBYSA",
  CCBYND = "CCBYND",
  CCBYNCSA = "CCBYNCSA",
  CCBYNCND = "CCBYNCND",
}

type CountProviderProps = {children: React.ReactNode}
type State = {
  verifiable: boolean,
  return_bounds: boolean,
  // TODO: technically this is not any Object but a "Taxon" and should be typed as such (e.g., in realm model)
  taxon: Object | undefined,
  taxon_id: number | undefined,
  taxon_name: string | undefined,
  place_id: number | null | undefined,
  place_guess: string,
  user_id: number | undefined,
  // TODO: technically this is not any Object but a "User" and should be typed as such (e.g., in realm model)
  user: Object | undefined,
  project_id: number | undefined,
  // TODO: technically this is not any Object but a "Project" and should be typed as such (e.g., in realm model)
  project: Object | undefined,
  sortBy: SORT_BY,
  researchGrade: boolean,
  needsID: boolean,
  casual: boolean,
  hrank: TAXONOMIC_RANK | undefined,
  lrank: TAXONOMIC_RANK | undefined,
  dateObserved: DATE_OBSERVED,
  observed_on: string | null | undefined,
  months: number[] | null | undefined,
  dateUploaded: DATE_UPLOADED,
  created_on: string | null | undefined,
  media: MEDIA,
  introduced: boolean,
  native: boolean,
  endemic: boolean,
  noStatus: boolean
  wildStatus: WILD_STATUS,
  reviewedFilter: REVIEWED,
  photoLicense: PHOTO_LICENSE
}
type Action = {type: EXPLORE_ACTION.RESET}
  | {type: EXPLORE_ACTION.DISCARD, snapshot: State}
  | {type: EXPLORE_ACTION.SET_USER, user: Object, userId: number}
  | {type: EXPLORE_ACTION.CHANGE_TAXON, taxon: Object, taxonId: number, taxonName: string}
  | {type: EXPLORE_ACTION.SET_TAXON_NAME, taxonName: string}
  | {type: EXPLORE_ACTION.SET_PLACE, placeId: number, placeName: string}
  | {type: EXPLORE_ACTION.SET_PROJECT, project: Object, projectId: number}
  | {type: EXPLORE_ACTION.CHANGE_SORT_BY, sortBy: SORT_BY}
  | {type: EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE}
  | {type: EXPLORE_ACTION.TOGGLE_NEEDS_ID}
  | {type: EXPLORE_ACTION.TOGGLE_CASUAL}
  | {type: EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK, hrank: TAXONOMIC_RANK}
  | {type: EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK, lrank: TAXONOMIC_RANK}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT, observed_on: string}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS, months: number[]}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT, created_on: string}
  | {type: EXPLORE_ACTION.SET_MEDIA, media: MEDIA}
  | {type: EXPLORE_ACTION.TOGGLE_INTRODUCED}
  | {type: EXPLORE_ACTION.TOGGLE_NATIVE}
  | {type: EXPLORE_ACTION.TOGGLE_ENDEMIC}
  | {type: EXPLORE_ACTION.TOGGLE_NO_STATUS}
  | {type: EXPLORE_ACTION.SET_WILD_STATUS, wildStatus: WILD_STATUS}
  | {type: EXPLORE_ACTION.SET_REVIEWED, reviewedFilter: REVIEWED}
  | {type: EXPLORE_ACTION.SET_PHOTO_LICENSE, photoLicense: PHOTO_LICENSE}
type Dispatch = (action: Action) => void

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

// Every key in this object represents a numbered filter in the UI
const calculatedFilters = {
  user_id: undefined,
  project_id: undefined,
  researchGrade: true,
  needsID: true,
  casual: false,
  hrank: undefined,
  lrank: undefined,
  dateObserved: DATE_OBSERVED.ALL,
  dateUploaded: DATE_UPLOADED.ALL,
  media: MEDIA.ALL,
  introduced: false,
  native: false,
  endemic: false,
  noStatus: false,
  wildStatus: WILD_STATUS.ALL,
  reviewedFilter: REVIEWED.ALL,
  photoLicense: PHOTO_LICENSE.ALL
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  user: undefined,
  project: undefined,
  sortBy: SORT_BY.DATE_UPLOADED_NEWEST,
  observed_on: undefined,
  months: undefined,
  created_on: undefined,
};

const initialState = {
  ...defaultFilters,
  taxon: undefined,
  taxon_id: undefined,
  taxon_name: undefined,
  place_id: undefined,
  place_guess: "",
  verifiable: true,
  return_bounds: true,
};

// Checks if the date is in the format XXXX-XX-XX
function isValidDateFormat(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
}

function exploreReducer( state: State, action: Action ) {
  switch ( action.type ) {
    case EXPLORE_ACTION.RESET:
      return {
        ...state,
        ...defaultFilters
      };
    case EXPLORE_ACTION.DISCARD:
      return action.snapshot;
    case EXPLORE_ACTION.CHANGE_TAXON:
      return {
        ...state,
        taxon: action.taxon,
        taxon_id: action.taxonId,
        taxon_name: action.taxonName
      };
    case EXPLORE_ACTION.SET_TAXON_NAME:
      return {
        ...state,
        taxon_name: action.taxonName
      };
    case EXPLORE_ACTION.SET_PLACE:
      return {
        ...state,
        place_id: action.placeId,
        place_guess: action.placeName
      };
    case EXPLORE_ACTION.SET_USER:
      return {
        ...state,
        user: action.user,
        user_id: action.userId
      };
    case EXPLORE_ACTION.SET_PROJECT:
      return {
        ...state,
          project: action.project,
          project_id: action.projectId
      };
    case EXPLORE_ACTION.CHANGE_SORT_BY:
      return {
        ...state,
        sortBy: action.sortBy
      };
    case EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE:
      return {
        ...state,
        researchGrade: !state.researchGrade
      };
    case EXPLORE_ACTION.TOGGLE_NEEDS_ID:
      return {
        ...state,
        needsID: !state.needsID
      };
    case EXPLORE_ACTION.TOGGLE_CASUAL:
      return {
        ...state,
        casual: !state.casual
      };
    case EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK:
      return {
        ...state,
        hrank: action.hrank
      };
    case EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK:
      return {
        ...state,
        lrank: action.lrank
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_ALL:
      return {
        ...state,
        dateObserved: DATE_OBSERVED.ALL,
        observed_on: null,
        months: null
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT:
      if ( !isValidDateFormat( action.observed_on ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateObserved: DATE_OBSERVED.EXACT_DATE,
        observed_on: action.observed_on,
        months: null
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS:
      return {
        ...state,
        dateObserved: DATE_OBSERVED.MONTHS,
        observed_on: null,
        months: action.months
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_ALL:
      return {
        ...state,
        dateUploaded: DATE_UPLOADED.ALL,
        created_on: null
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT:
      if ( !isValidDateFormat( action.created_on ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateUploaded: DATE_UPLOADED.EXACT_DATE,
        created_on: action.created_on
      };
    case EXPLORE_ACTION.SET_MEDIA:
      return {
        ...state,
        media: action.media
      };
    case EXPLORE_ACTION.TOGGLE_INTRODUCED:
      return {
        ...state,
        introduced: !state.introduced
      };
    case EXPLORE_ACTION.TOGGLE_NATIVE:
      return {
        ...state,
        native: !state.native
      };
    case EXPLORE_ACTION.TOGGLE_ENDEMIC:
      return {
        ...state,
        endemic: !state.endemic
      };
    case EXPLORE_ACTION.TOGGLE_NO_STATUS:
      return {
        ...state,
        noStatus: !state.noStatus
      };
    case EXPLORE_ACTION.SET_WILD_STATUS:
      return {
        ...state,
        wildStatus: action.wildStatus
      };
    case EXPLORE_ACTION.SET_PHOTO_LICENSE:
      return {
        ...state,
        photoLicense: action.photoLicense
      };
    case EXPLORE_ACTION.SET_REVIEWED:
      return {
        ...state,
        reviewedFilter: action.reviewedFilter
      };
    default: {
      throw new Error( `Unhandled action type: ${(action as Action).type}` );
    }
  }
}

const ExploreProvider = ( { children }: CountProviderProps ) => {
  const [state, dispatch] = React.useReducer( exploreReducer, initialState );

  // To store a snapshot of the state, e.g when the user opens the filters modal
  const [snapshot, setSnapshot] = React.useState<State | undefined>( undefined );
  const makeSnapshot = () => setSnapshot( state );
  
  // Check if the current state is different from the snapshot
  const checkSnapshot = () => {
    if ( !snapshot ) {
      return false;
    }
    return Object.keys( snapshot ).some( key => snapshot[key] !== state[key] );
  }
  const differsFromSnapshot: boolean = checkSnapshot();

  const discardChanges = () => {
    if ( !snapshot ) {
      return;
    }
    dispatch( { type: EXPLORE_ACTION.DISCARD, snapshot } );
  }

  const filtersNotDefault: boolean = Object.keys( defaultFilters ).some(
    key => defaultFilters[key] !== state[key]
  );

  let numberOfFilters: number = Object.keys( calculatedFilters ).reduce(
    ( count, key ) => {
      if ( state[key] !== calculatedFilters[key] ) {
        return count + 1;
      }
      return count;
    },
    0
  );
  // If both low and high rank filters are set, we only count one filter
  if (state.lrank && state.hrank) {
    numberOfFilters -= 1;
  }

  const value = { state, dispatch, filtersNotDefault, numberOfFilters, makeSnapshot, differsFromSnapshot, discardChanges };
  return (
    <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
  );
};

function useExplore() {
  const context = React.useContext( ExploreContext );
  if ( context === undefined ) {
    throw new Error( "useExplore must be used within a ExploreProvider" );
  }
  return context;
}

export { ExploreProvider, useExplore };
