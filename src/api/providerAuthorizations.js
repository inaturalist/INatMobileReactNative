// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "provider_name,created_at"
};

const fetchProviderAuthorizations = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.provider_authorizations.search(
      { ...PARAMS, ...params },
      opts
    );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchProviderAuthorizations;
