// @flow

import { useNavigation } from "@react-navigation/native";
import { INatIconButton } from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { View } from "components/styledComponents";
import LocationIndicator from "images/svg/location_indicator.svg";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import MapView, {
  Circle,
  Marker,
  Polygon,
  UrlTile
} from "react-native-maps";
import { useTheme } from "react-native-paper";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";
import { useDeviceOrientation } from "sharedHooks";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

const calculateZoom = ( width, delta ) => Math.round(
  Math.log2( 360 * ( width / 256 / delta ) ) + 1
);

const POINT_TILES_ENDPOINT = "https://tiles.inaturalist.org/v1/points";
const API_ENDPOINT = "https://api.inaturalist.org/v2";

const OBSCURATION_CELL_SIZE = 0.2;

// Adapted from
// https://github.com/inaturalist/inaturalist/blob/main/app/assets/javascripts/inaturalist/map3.js.erb#L1500
function obscurationCellForLatLng( lat, lng ) {
  const coords = [lat, lng];
  const firstCorner = [
    coords[0] - ( coords[0] % OBSCURATION_CELL_SIZE ),
    coords[1] - ( coords[1] % OBSCURATION_CELL_SIZE )
  ];
  const secondCorner = [firstCorner[0], firstCorner[1]];
  coords.forEach( ( value, index ) => {
    if ( value < secondCorner[index] ) {
      secondCorner[index] -= OBSCURATION_CELL_SIZE;
    } else {
      secondCorner[index] += OBSCURATION_CELL_SIZE;
    }
  } );
  return {
    minLat: Math.min( firstCorner[0], secondCorner[0] ),
    minLng: Math.min( firstCorner[1], secondCorner[1] ),
    maxLat: Math.max( firstCorner[0], secondCorner[0] ),
    maxLng: Math.max( firstCorner[1], secondCorner[1] )
  };
}

type Props = {
  children?: any,
  className?: string,
  mapHeight?: number|string, // allows for height to be defined as px or percentage
  mapViewRef?: Object,
  mapType?: string,
  minZoomLevel?: number,
  obscured?: boolean,
  obsLatitude: number,
  obsLongitude: number,
  onMapReady?: Function,
  onRegionChange?: Function,
  onRegionChangeComplete?: Function,
  openMapScreen?: Function,
  positionalAccuracy?: number,
  region?: Object,
  showCurrentLocationButton?: boolean,
  showLocationIndicator?: boolean,
  showsCompass?: boolean,
  startAtUserLocation?: boolean,
  style?: Object,
  tileMapParams?: Object,
  withObsTiles?: boolean
}

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  children,
  className = "flex-1",
  mapHeight,
  mapViewRef: mapViewRefProp,
  mapType,
  minZoomLevel,
  obscured,
  obsLatitude,
  obsLongitude,
  onMapReady = ( ) => { },
  onRegionChange,
  onRegionChangeComplete,
  openMapScreen,
  positionalAccuracy,
  region,
  showCurrentLocationButton,
  showLocationIndicator,
  showsCompass,
  startAtUserLocation = false,
  style,
  tileMapParams,
  withObsTiles
}: Props ): Node => {
  const { screenWidth } = useDeviceOrientation( );
  const [currentZoom, setCurrentZoom] = useState(
    region
      ? calculateZoom( screenWidth, region.longitudeDelta )
      : 5
  );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const [permissionRequested, setPermissionRequested] = useState( false );
  const [showsUserLocation, setShowsUserLocation] = useState( false );
  const [userLocation, setUserLocation] = useState( null );
  const { t } = useTranslation( );
  const mapViewRef = useRef( mapViewRefProp );

  const initialLatitude = obsLatitude;
  const initialLongitude = obsLongitude;

  let initialRegion = {
    latitude: initialLatitude || 0,
    longitude: initialLongitude || 0,
    latitudeDelta: initialLatitude
      ? 0.2
      : 100,
    longitudeDelta: initialLatitude
      ? 0.2
      : 100
  };

  // Kind of obtuse, but the more obvious approach of making a function that
  // pans the map results in a function that gets recreated every time the
  // userLocation changes
  const [panToUserLocationRequested, setPanToUserLocationRequested] = useState(
    startAtUserLocation
  );
  useEffect( ( ) => {
    if ( userLocation && panToUserLocationRequested && mapViewRef?.current ) {
      mapViewRef.current.animateToRegion( {
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      } );
      setPanToUserLocationRequested( false );
    }
  }, [userLocation, panToUserLocationRequested, region] );

  // Kludge for the fact that the onUserLocationChange callback in MapView
  // won't fire if showsUserLocation is true on the first render
  useEffect( ( ) => {
    setShowsUserLocation( true );
  }, [] );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const onPermissionGranted = useCallback( ( ) => {
    setPermissionRequested( false );
    setShowsUserLocation( true );
    setPanToUserLocationRequested( true );
  }, [setPermissionRequested, setShowsUserLocation, setPanToUserLocationRequested] );
  const onPermissionBlocked = useCallback( ( ) => {
    setPermissionRequested( false );
    setShowsUserLocation( false );
  }, [setPermissionRequested, setShowsUserLocation] );
  const onPermissionDenied = useCallback( ( ) => {
    setPermissionRequested( false );
    setShowsUserLocation( false );
  }, [setPermissionRequested, setShowsUserLocation] );

  const params = useMemo( ( ) => ( {
    ...tileMapParams,
    color: "%2374ac00",
    verifiable: "true"
  } ), [tileMapParams] );

  const obscurationCell = obscurationCellForLatLng( obsLatitude, obsLongitude );
  if ( obscured ) {
    initialRegion = {
      latitude: obscurationCell.minLat + ( OBSCURATION_CELL_SIZE / 2 ),
      longitude: obscurationCell.minLng + ( OBSCURATION_CELL_SIZE / 2 ),
      latitudeDelta: 0.3,
      longitudeDelta: 0.3
    };
  }

  const queryString = Object.keys( params ).map( key => `${key}=${params[key]}` ).join( "&" );

  const url = currentZoom > 13
    ? `${API_ENDPOINT}/points/{z}/{x}/{y}.png`
    : `${API_ENDPOINT}/grid/{z}/{x}/{y}.png`;
  const urlTemplate = `${url}?${queryString}`;

  const onMapPressForObsLyr = useCallback( async latLng => {
    const UTFPosition = createUTFPosition( currentZoom, latLng.latitude, latLng.longitude );
    const {
      mTilePositionX,
      mTilePositionY,
      mPixelPositionX,
      mPixelPositionY
    } = UTFPosition;
    const tilesParams = {
      ...params,
      style: "geotilegrid"
    };
    const gridQuery = Object.keys( tilesParams )
      .map( key => `${key}=${tilesParams[key]}` ).join( "&" );

    const gridUrl = `${POINT_TILES_ENDPOINT}/${currentZoom}/${mTilePositionX}/${mTilePositionY}`
      + ".grid.json";
    const gridUrlTemplate = `${gridUrl}?${gridQuery}`;

    const options = {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    };

    const response = await fetch( gridUrlTemplate, options );
    const json = await response.json( );

    const observation = getDataForPixel( mPixelPositionX, mPixelPositionY, json );
    const uuid = observation?.uuid;

    if ( uuid ) {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  }, [params, currentZoom, navigation] );

  const locationIndicator = () => (
    // $FlowIgnore
    <LocationIndicator
      testID="Map.LocationIndicator"
      width={25}
      height={32}
    />
  );

  return (
    <View
      style={[
        mapHeight
          ? { height: mapHeight }
          : null
      ]}
      testID="MapView"
      className="flex-1 h-full"
    >
      <MapView
        ref={mapViewRef}
        testID="Map.MapView"
        className={className}
        region={( region?.latitude )
          ? region
          : initialRegion}
        onRegionChange={onRegionChange}
        onUserLocationChange={locationChangeEvent => {
          const coordinate = locationChangeEvent?.nativeEvent?.coordinate;
          if (
            coordinate?.latitude
            && coordinate.latitude.toFixed( 4 ) !== userLocation?.latitude.toFixed( 4 )
          ) {
            setUserLocation( coordinate );
          }
        }}
        showsUserLocation={showsUserLocation}
        loadingEnabled
        onRegionChangeComplete={async newRegion => {
          if ( onRegionChangeComplete ) onRegionChangeComplete( newRegion );
          setCurrentZoom( calculateZoom( screenWidth, newRegion.longitudeDelta ) );
        }}
        onPress={e => {
          if ( withObsTiles ) onMapPressForObsLyr( e.nativeEvent.coordinate );
          else if ( openMapScreen ) {
            openMapScreen( );
          }
        }}
        showsCompass={showsCompass}
        mapType={mapType || "standard"}
        minZoomLevel={minZoomLevel}
        onMapReady={onMapReady}
        style={style}
      >
        {withObsTiles && urlTemplate && (
          <UrlTile
            testID="Map.UrlTile"
            tileSize={512}
            urlTemplate={urlTemplate}
          />
        )}
        {( showLocationIndicator && ( !obscured ) ) && (
          <>
            <Circle
              center={{
                latitude: obsLatitude,
                longitude: obsLongitude
              }}
              radius={positionalAccuracy}
              strokeWidth={2}
              strokeColor="#74AC00"
              fillColor="rgba( 116, 172, 0, 0.2 )"
            />
            <Marker
              coordinate={{
                latitude: obsLatitude,
                longitude: obsLongitude
              }}
            >
              {locationIndicator()}
            </Marker>
          </>
        )}
        {( showLocationIndicator && obscured ) && (
          <Polygon
            coordinates={[
              {
                latitude: obscurationCell.minLat,
                longitude: obscurationCell.minLng
              },
              {
                latitude: obscurationCell.minLat,
                longitude: obscurationCell.maxLng
              },
              {
                latitude: obscurationCell.maxLat,
                longitude: obscurationCell.maxLng
              },
              {
                latitude: obscurationCell.maxLat,
                longitude: obscurationCell.minLng
              }
            ]}
            strokeWidth={2}
            strokeColor={colors.inatGreen}
            fillColor="rgba( 116, 172, 0, 0.2 )"
          />
        )}
      </MapView>
      { showCurrentLocationButton && (
        <INatIconButton
          icon="location-crosshairs"
          className="absolute bottom-5 right-5 bg-white rounded-full"
          style={getShadow( theme.colors.primary )}
          accessibilityLabel={t( "User-location" )}
          onPress={( ) => {
            setPanToUserLocationRequested( true );
            setShowsUserLocation( true );
            setPermissionRequested( true );
          }}
        />
      )}
      <LocationPermissionGate
        permissionNeeded={permissionRequested}
        onPermissionGranted={onPermissionGranted}
        onPermissionBlocked={onPermissionBlocked}
        onPermissionDenied={onPermissionDenied}
        withoutNavigation
      />
      {children}
    </View>
  );
};

export default Map;
