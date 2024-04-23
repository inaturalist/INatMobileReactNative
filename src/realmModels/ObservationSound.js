import { Realm } from "@realm/react";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import uuid from "react-native-uuid";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

import Sound from "./Sound";

class ObservationSound extends Realm.Object {
  static OBSERVATION_SOUNDS_FIELDS = {
    id: true,
    uuid: true,
    sound: Sound.SOUND_FIELDS
  };

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static async new( observationSound ) {
    const soundUUID = uuid.v4( );

    return {
      ...observationSound,
      uuid: soundUUID
    };
    /* eslint-enable camelcase */
  }

  static mapApiToRealm( observationSound, realm = null ) {
    const localObsSound = {
      ...observationSound,
      _synced_at: new Date( ),
      photo: Sound.mapApiToRealm( observationSound.sound, realm )
    };
    return localObsSound;
  }

  static mapSoundForUpload( id, observationSound ) {
    const fileExt = Platform.OS === "android"
      ? "mp4"
      : "m4a";

    return {
      // Sound UUIDs don't really do anything at present. When
      // https://github.com/inaturalist/iNaturalistReactNative/issues/1068 is
      // completed we can use them to prevent the creation of duplicate sound
      // records
      // "sound[uuid]": observationSound.sound.uuid,
      file: new FileUpload( {
        uri: observationSound.sound.file_url,
        name: `${observationSound.uuid}.${fileExt}`,
        type: `audio/${fileExt}`
      } )
    };
  }

  static mapSoundForAttachingToObs( id, observationSound ) {
    return {
      "observation_sound[observation_id]": id,
      "observation_sound[sound_id]": observationSound.id
    };
  }

  static async deleteLocalObservationSound( realm, uri, obsUUID ) {
    // delete uri on disk
    Sound.deleteSoundFromDeviceStorage( uri );
    const realmObs = realm.objectForPrimaryKey( "Observation", obsUUID );
    const obsSoundToDelete = realmObs?.observationSounds
      .find( p => p.file_url === uri );
    if ( obsSoundToDelete ) {
      safeRealmWrite( realm, ( ) => {
        realm?.delete( obsSoundToDelete );
      }, "deleting local observation sound in ObservationSound" );
    }
  }

  static schema = {
    name: "ObservationSound",
    embedded: true,
    properties: {
      // datetime the obsSound was created on the device
      _created_at: "date?",
      // datetime the obsSound was last synced with the server
      _synced_at: "date?",
      // datetime the obsSound was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      // file_url: { type: "string", mapTo: "fileUrl" },
      sound: "Sound?",
      // this creates an inverse relationship so observation sounds
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationSounds"
      }
    }
  };
}

export default ObservationSound;
