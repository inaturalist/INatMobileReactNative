// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const mappedRecords = {
  taxa: "taxon",
  places: "place",
  users: "user",
  projects: "project"
};

const PARAMS = {
  per_page: 10,
  fields: "all"
};

const fetchSearchResults = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.search( { ...PARAMS, ...params }, opts );
    if ( !response ) { return null; }
    const records = response?.results?.map( result => {
      const recordType = mappedRecords[params.sources];
      return result[recordType];
    } );
    return records;
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchSearchResults;
