import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import {
  Image, Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { textStyles, viewStyles } from "../../styles/settings/settings";
import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";

const UserSearchInput = ( { onUserChanged } ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );
  const userResults = useRemoteSearchResults(
    finalUserSearch,
    "users",
    "user.login,user.name,user.icon"
  ).map( r => r.user );

  useEffect( () => {
    if ( finalUserSearch.length === 0 ) {
      setHideResults( true );
    }
  }, [finalUserSearch] );

  return (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={v => {
            setHideResults( false );
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable
          style={viewStyles.clearSearch}
          onPress={() => {
            setHideResults( true );
            onUserChanged( null );
            setUserSearch( "" );
          }}
        >
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "../../images/clear.png" )}
          />
        </Pressable>
      </View>
      {!hideResults && finalUserSearch.length > 0 && userResults.map( result => (
        <Pressable
          key={result.id}
          style={[viewStyles.row, viewStyles.placeResultContainer]}
          onPress={() => {
            setHideResults( true );
            onUserChanged( result );
            setUserSearch( result.login );
          }}
        >
          <Image
            style={viewStyles.userPic}
            resizeMode="contain"
            source={{ uri: result.icon }}
          />
          <Text style={textStyles.resultPlaceName}>{result.login}</Text>
          <Text style={textStyles.resultPlaceType}>{result.name}</Text>
        </Pressable>
      ) )}
    </View>
  );
};

export default UserSearchInput;
