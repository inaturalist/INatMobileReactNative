// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const ANCESTOR_FIELDS = {
  name: true,
  preferred_common_name: true,
  rank: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const FIELDS = {
  ancestors: ANCESTOR_FIELDS,
  default_photo: {
    url: true
  },
  name: true,
  preferred_common_name: true,
  rank: true,
  taxon_photos: {
    photo: PHOTO_FIELDS
  },
  wikipedia_summary: true,
  wikipedia_url: true
};

const PARAMS = {
  fields: FIELDS
};

async function fetchTaxon( id: number, params: Object = {}, opts: Object = {} ): Promise<any> {
  try {
    const { results } = await inatjs.taxa.fetch( id, { ...PARAMS, ...params }, opts );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
}

async function searchTaxa( params: Object = {}, opts: Object = {} ): Promise<any> {
  try {
    const { results } = await inatjs.taxa.search( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
}

export {
  fetchTaxon,
  searchTaxa
};
