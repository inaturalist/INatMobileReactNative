import { useNetInfo } from "@react-native-community/netinfo";

const useIsOnline = ( ): boolean => {
  const netInfo = useNetInfo( );
  // assume there is network connectivity until proven otherwise
  // this should prevent the UI from flickering while isConnected
  // is fetched
  return netInfo.isConnected === null ? true : netInfo.isConnected;
};

export default useIsOnline;
