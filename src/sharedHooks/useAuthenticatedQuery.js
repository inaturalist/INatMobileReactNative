// @flow

import { useQuery } from "@tanstack/react-query";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { reactQueryRetry } from "sharedHelpers/logging";

// Should work like React Query's useQuery except it calls the queryFunction
// with an object that includes the JWT
const useAuthenticatedQuery = (
  queryKey: Array<string>,
  queryFunction: Function,
  queryOptions: Object = {}
): Object => useQuery( {
  queryKey: [...queryKey, queryOptions.allowAnonymousJWT],
  queryFn: async ( ) => {
    // Note, getJWT() takes care of fetching a new token if the existing
    // one is expired. We *could* store the token in state with useState if
    // fetching from RNSInfo becomes a performance issue
    const apiToken = await getJWT( queryOptions.allowAnonymousJWT );
    const options = {
      api_token: apiToken
    };
    return queryFunction( options );
  },
  retry: ( failureCount, error ) => reactQueryRetry( failureCount, error, {
    queryKey
  } ),
  ...queryOptions
} );

export default useAuthenticatedQuery;
