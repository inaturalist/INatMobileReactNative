// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const MEMBER_PROJECT_FIELDS = {
  title: true,
  icon: true
};

const MEMBER_PROJECT_PARAMS = {
  per_page: 10,
  fields: MEMBER_PROJECT_FIELDS
};

const REMOTE_USER_FIELDS = {
  created_at: true,
  description: true,
  icon_url: true,
  id: true,
  identifications_count: true,
  journal_posts_count: true,
  locale: true,
  login: true,
  monthly_supporter: true,
  name: true,
  observations_count: true,
  place_id: true,
  roles: true,
  site: {
    name: true
  },
  species_count: true,
  updated_at: true,
  prefers_common_names: true,
  prefers_scientific_name_first: true
};

const REMOTE_USER_PARAMS = {
  fields: REMOTE_USER_FIELDS
};

const fetchUserMe = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const response = await inatjs.users.me( { ...REMOTE_USER_PARAMS, ...params, ...opts } );
    return response?.results[0];
  } catch ( e ) {
    return handleError( e, { throw: true } );
  }
};

const fetchMemberProjects = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.users.projects( {
      ...MEMBER_PROJECT_PARAMS,
      ...params,
      ...opts
    } );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchRemoteUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  if ( !id ) return null;
  try {
    const { results } = await inatjs.users.fetch( id, {
      ...REMOTE_USER_PARAMS,
      ...params,
      ...opts
    } );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchRemoteUsers = async (
  ids: Array<number>,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const responses = await Promise.all( ids.map(
      userId => inatjs.users.fetch( userId, {
        ...REMOTE_USER_PARAMS,
        ...params,
        ...opts
      } )
    ) );
    return responses.map( r => r.results[0] );
  } catch ( e ) {
    return handleError( e );
  }
};

const blockUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const response = await inatjs.users.block( { id }, {
      ...params,
      ...opts
    } );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const muteUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const response = await inatjs.users.mute( { id }, {
      ...params,
      ...opts
    } );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const unblockUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const response = await inatjs.users.unblock( { id }, {
      ...params,
      ...opts
    } );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const unmuteUser = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const response = await inatjs.users.unmute( { id }, {
      ...params,
      ...opts
    } );
    return response;
  } catch ( e ) {
    return handleError( e );
  }
};

const updateUsers = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    return await inatjs.users.update( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  blockUser,
  fetchMemberProjects,
  fetchRemoteUser,
  fetchRemoteUsers,
  fetchUserMe,
  muteUser,
  unblockUser,
  unmuteUser,
  updateUsers
};
