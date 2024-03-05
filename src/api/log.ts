import { getUserAgent } from "api/userAgent";
import { create } from "apisauce";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import Config from "react-native-config";
import { transportFunctionType } from "react-native-logs";

const API_HOST: string
    = Config.API_URL || process.env.API_URL || "https://api.inaturalist.org/v2";

// Custom transport for posting to iNat API logging
const iNatLogstashTransport: transportFunctionType = async (props) => {
  const userToken = await getJWT(); // Removed the import causing the dependency cycle
  if ( !userToken ) {
    return;
  }
  const api = create( {
    baseURL: API_HOST,
    headers: {
      "User-Agent": getUserAgent(),
      Authorization: [
        userToken,
      ].join( ", " )
    }
  } );
  const message
        = typeof props.rawMsg === "string"
          ? props.rawMsg
          : props.rawMsg.join( " " );
  const formData = {
    level: props.level.text,
    message,
    context: props.extension
  };
  const response = await api.post( "/log", formData );
};

export default iNatLogstashTransport;
