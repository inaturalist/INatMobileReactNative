// @flow

import inatjs from "inaturalistjs";
import Identification from "realmModels/Identification";

import handleError from "./error";

const PARAMS = {
  fields: Identification.ID_FIELDS
};

const createIdentification = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.identifications.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const updateIdentification = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.identifications.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createIdentification,
  updateIdentification
};
