// @flow

import { parse } from "date-fns";
import piexif from "piexifjs";
import { useEffect, useState } from "react";
import RNFS from "react-native-fs";

const lpad = n => ( n > 9 ? `${n}` : `0${n}` );
const exifTimeToString = time => (
  `${lpad( time[0][0] )}:${lpad( time[1][0] )}:${lpad( time[2][0] )}`
);

// Try different methods of retrieving the date/time the photo was taken it
const parseExifDateTime = ( exif: ?{ [key: string]: any} ): ?Date => {
  if ( !exif ) return null;

  // GPSDateStamp is defined as UTC / GMT+0
  const date = exif.GPSDateStamp;
  const time = exif.GPSTimeStamp;
  let datetime = null;

  if ( !date || ( date.startsWith( "1970" ) ) || !time ) {
    const dateTimeValue = exif.DateTimeOriginal;
    datetime = dateTimeValue ? dateTimeValue.trim() : null;
  } else {
    datetime = `${date.trim()} ${exifTimeToString( time )}`;
  }

  if ( !datetime ) {
    datetime = exif.DateTime;
  }

  if ( datetime ) {
    // Assume local timezone
    try {
      return parse( datetime, "yyyy:MM:dd HH:mm:ss", new Date() );
    } catch ( e ) {
      console.log( `Couldn't parse date ${datetime}`, e.message );
      return null;
    }
  }

  return null;
};

type Location = {
  latitude: number,
  longitude: number,
  positionalAccuracy: ?number
};

// Parses GPS coordinates and positional accuracy from EXIF
const parseExifCoordinates = ( exif: ?{ [key: string]: any} ): ?Location => {
  if ( !exif ) return null;

  const latitude = exif.GPSLatitude;
  const latitudeRef = exif.GPSLatitudeRef;
  const longitude = exif.GPSLongitude;
  const longitudeRef = exif.GPSLongitudeRef;
  let positionalAccuracy = exif.GPSHPositioningError;

  if ( latitude && longitude && latitudeRef !== undefined && longitudeRef !== undefined
    && latitude.length >= 3 && longitude.length >= 3 ) {
    if ( positionalAccuracy !== undefined && positionalAccuracy.length === 2 ) {
      // Convert to integer and round any accuracy less than 1 (but greater than zero) to 1
      positionalAccuracy = positionalAccuracy[0] / positionalAccuracy[1];
      positionalAccuracy = positionalAccuracy > 0 && positionalAccuracy < 1
        ? 1 : parseInt( positionalAccuracy, 10 );
    } else {
      positionalAccuracy = null;
    }

    return {
      latitude: piexif.GPSHelper.dmsRationalToDeg( latitude, latitudeRef ),
      longitude: piexif.GPSHelper.dmsRationalToDeg( longitude, longitudeRef ),
      positionalAccuracy
    };
  }

  return null;
};

const usePhotoExif = ( photoUri: ?string ): Object => {
  const [exif, setExif] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;

    const parseExif = async ( ): Promise<Object> => {
      try {
        const data = await RNFS.readFile( photoUri, "base64" );
        const rawExif = piexif.load( `data:image/jpeg;base64,${data}` );

        const parsedExif = {};

        Object.keys( rawExif ).forEach( ifd => {
          if ( ifd === "thumbnail" ) {
            return;
          }

          Object.keys( rawExif[ifd] ).forEach( tag => {
            parsedExif[piexif.TAGS[ifd][tag].name] = rawExif[ifd][tag];
          } );
        } );

        if ( !isCurrent ) { return; }

        setExif( parsedExif );
      } catch ( e ) {
        console.log( e, "Couldn't parse EXIF" );
      }
    };

    if ( photoUri ) {
      parseExif();
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [photoUri] );

  return exif;
};

export default usePhotoExif;
export { parseExifCoordinates, parseExifDateTime };
