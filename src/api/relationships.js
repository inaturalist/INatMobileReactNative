// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const fetchRelationships = async ( params: any = {}, opts: any = {} ): Promise<any> => {
  try {
    const response = await inatjs.relationships.search( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const createRelationships = async ( params: any = {}, opts: any = {} ): Promise<any> => {
  try {
    const response = await inatjs.relationships.create( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const updateRelationships = async ( params: any = {}, opts: any = {} ): Promise<any> => {
  try {
    const response = await inatjs.relationships.update( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const deleteRelationships = async ( params: any = {}, opts: any = {} ): Promise<any> => {
  try {
    const response = await inatjs.relationships.delete( params, opts );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createRelationships,
  deleteRelationships,
  fetchRelationships,
  updateRelationships
};
