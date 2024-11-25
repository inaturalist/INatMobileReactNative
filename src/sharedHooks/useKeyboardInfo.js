import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Keyboard
} from "react-native";

// Returns info about the keyboard, like whether it's up and how tall it is
const useKeyboardInfo = ( targetNonKeyboardHeight: number ) => {
  const [keyboardShown, setKeyboardShown] = useState( false );
  const [keyboardHeight, setKeyboardHeight] = useState( 0 );
  const nonKeyboardHeight = useMemo(
    ( ) => Dimensions.get( "screen" ).height - keyboardHeight,
    [keyboardHeight]
  );

  const keyboardVerticalOffset = useMemo( ( ) => ( nonKeyboardHeight < targetNonKeyboardHeight
    ? nonKeyboardHeight - targetNonKeyboardHeight
    : 30 ), [nonKeyboardHeight, targetNonKeyboardHeight] );

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", keyboardDidShowEvent => {
      if ( !keyboardShown ) {
        setKeyboardHeight( keyboardDidShowEvent.endCoordinates.height );
        setKeyboardShown( true );
      }
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", keyboardDidHideEvent => {
      if ( keyboardShown ) {
        setKeyboardHeight( keyboardDidHideEvent.endCoordinates.height );
        setKeyboardShown( false );
      }
    } );

    return ( ) => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [keyboardShown] );

  return {
    keyboardShown,
    keyboardVerticalOffset,
    nonKeyboardHeight
  };
};

export default useKeyboardInfo;
