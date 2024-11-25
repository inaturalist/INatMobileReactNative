export interface RealmObservationPhoto {
  originalPhotoUri?: string;
}

export interface RealmObservation {
  _created_at?: Date;
  _synced_at?: Date;
  captive_flag: boolean | null;
  description: string | null;
  geoprivacy: string | null;
  latitude: number | null;
  longitude: number | null;
  observationPhotos: Array<RealmObservationPhoto>;
  observationSounds: Array<Object>;
  observed_on_string: string | null;
  owners_identification_from_vision: boolean | null;
  place_guess: string | null;
  positional_accuracy: number | null;
  species_guess: string | null;
  taxon_id: number | null;
  uuid: string;
}
