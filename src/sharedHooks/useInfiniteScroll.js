// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { flatten } from "lodash";

const useInfiniteScroll = (
  queryKey: string,
  apiCall: Function,
  newInputParams: Object
): Object => {
  const baseParams = {
    ...newInputParams,
    per_page: 10,
    ttl: -1
  };

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    status
  } = useInfiniteQuery( {
    // eslint-disable-next-line
    queryKey: [queryKey, baseParams],
    keepPreviousData: false,
    queryFn: async ( { pageParam = 0 } ) => {
      const params = {
        ...baseParams
      };

      params.page = pageParam;

      return apiCall( params );
    },
    getNextPageParam: lastPage => ( lastPage
      ? lastPage.page + 1
      : 1 )
  } );

  const pages = data?.pages;
  const allResults = pages?.map( page => page?.results );

  return {
    isFetchingNextPage,
    fetchNextPage,
    data: flatten( allResults ),
    totalResults: pages?.[0]
      ? pages?.[0].total_results
      : 0,
    status
  };
};

export default useInfiniteScroll;
