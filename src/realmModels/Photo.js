import ImageResizer from "@bam.tech/react-native-image-resizer";
import { Realm } from "@realm/react";
import { Platform } from "react-native";
import RNFS from "react-native-fs";

class Photo extends Realm.Object {
  static PHOTO_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    url: true
  };

  static photoUploadPath = `${RNFS.DocumentDirectoryPath}/photoUploads`;

  static mapApiToRealm( photo, _realm = null ) {
    const localPhoto = {
      ...photo,
      _synced_at: new Date( )
    };
    localPhoto.licenseCode = localPhoto.licenseCode || photo?.license_code;
    return localPhoto;
  }

  static async resizeImageForUpload( pathOrUri, options = {} ) {
    const width = 2048;
    const { photoUploadPath } = Photo;
    await RNFS.mkdir( photoUploadPath );
    let outFilename = pathOrUri.split( "/" ).slice( -1 ).pop( );

    // If pathOrUri is an ios localIdentifier, make up a filename based on that
    const iosLocalIdentifierMatches = pathOrUri.match( /^ph:\/\/([^/]+)/ );
    if ( iosLocalIdentifierMatches ) {
      outFilename = `${iosLocalIdentifierMatches[1]}.jpeg`;
    }

    // If pathOrUri is an ios localIdentifier, we don't have an actual local
    // file path that react-native-image-resizer can use, so instead we're
    // using react-native-fs resizing. If consistency becomes a problem, we
    // could instead use RNFS to copy the file locally and then resize it
    // with the resizer.
    if ( Platform.OS === "ios" && pathOrUri.match( /^ph:/ ) ) {
      const outPath = `${photoUploadPath}/${outFilename}`;
      const outUri = await RNFS.copyAssetsFileIOS( pathOrUri, outPath, width, width );
      return outUri;
    }

    // Work around path / uri bug: https://github.com/bamlab/react-native-image-resizer/issues/328
    let uriForResize = pathOrUri;
    if ( Platform.OS === "ios" && uriForResize.match( /^\// ) ) {
      uriForResize = `file://${uriForResize}`;
    }

    const { uri } = await ImageResizer.createResizedImage(
      uriForResize,
      width,
      width, // height
      "JPEG", // compressFormat
      100, // quality
      options.rotation || 0, // rotation
      photoUploadPath,
      true, // keep metadata
      {
        mode: "contain",
        onlyScaleDown: true
      }
    );
    return uri;
  }

  static async new( uri, resizeOptions = {} ) {
    const localFilePath = await Photo.resizeImageForUpload( uri, resizeOptions );

    return {
      _created_at: new Date( ),
      _updated_at: new Date( ),
      localFilePath
    };
  }

  // this is necessary because photos cannot be found reliably via the file:/// name.
  // without this, local photos will not show up when the app updates
  static accessLocalPhoto( url ) {
    const uuidAndJpgSuffix = url.split( "photoUploads/" )[1];
    const localPath = `${Photo.photoUploadPath}/${uuidAndJpgSuffix}`;
    return localPath;
  }

  static displayLargePhoto( url ) {
    return url?.replace( "square", "large" );
  }

  static displayMediumPhoto( url ) {
    return url?.replace( "square", "medium" );
  }

  static displayLocalOrRemoteLargePhoto( photo ) {
    return Photo.displayLargePhoto( photo?.url ) || Photo.accessLocalPhoto( photo?.localFilePath );
  }

  static displayLocalOrRemoteMediumPhoto( photo ) {
    return Photo.displayMediumPhoto( photo?.url ) || Photo.accessLocalPhoto( photo?.localFilePath );
  }

  static displayLocalOrRemoteSquarePhoto( photo ) {
    return photo?.url || Photo.accessLocalPhoto( photo?.localFilePath );
  }

  static deletePhotoFromDeviceStorage( url ) {
    RNFS.unlink( Photo.accessLocalPhoto( url ) );
  }

  static schema = {
    name: "Photo",
    embedded: true,
    properties: {
      // datetime the photo was created on the device
      _created_at: "date?",
      // datetime the photo was last synced with the server
      _synced_at: "date?",
      // datetime the photo was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      id: "int?",
      attribution: "string?",
      license_code: { type: "string", mapTo: "licenseCode", optional: true },
      url: "string?",
      localFilePath: "string?"
    }
  };

  // An unpleasant hack around another unpleasant hack, i.e. when we "need" to
  // convert Realm objects to JSON and we apparently lose attributions
  // defined with mapTo
  toJSON( ) {
    const json = super.toJSON( );
    return {
      ...json,
      licenseCode: json.license_code
    };
  }
}

export default Photo;
