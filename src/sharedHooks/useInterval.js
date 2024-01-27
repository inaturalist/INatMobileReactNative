// @flow

import { useEffect, useRef } from "react";

function useInterval( callback:Function, delay: number | null ) {
  const savedCallback = useRef<Function>( null );

  // Remember the latest callback function
  useEffect( () => {
    if ( delay === null ) return;
    savedCallback.current = callback;
  }, [callback, delay] );

  // Set up the interval
  useEffect( () => {
    function tick() {
      savedCallback.current();
    }
    if ( delay === null ) {
      return;
    }
    const id = setInterval( tick, delay );
    // eslint-disable-next-line consistent-return
    return () => clearInterval( id );
  }, [delay] );
}

export default useInterval;
