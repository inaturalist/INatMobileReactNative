import { Realm } from "@realm/react";

import Photo from "./Photo";

class Taxon extends Realm.Object {
  static TAXON_FIELDS = {
    ancestor_ids: true,
    default_photo: {
      id: true,
      url: true,
      attribution: true,
      license_code: true
    },
    iconic_taxon_name: true,
    is_active: true,
    name: true,
    preferred_common_name: true,
    rank: true,
    rank_level: true
  };

  static LIMITED_TAXON_FIELDS = {
    default_photo: {
      id: true,
      url: true
    },
    iconic_taxon_name: true,
    name: true,
    preferred_common_name: true,
    rank: true,
    rank_level: true
  };

  static STATEOFMATTER_LEVEL = 100;

  static KINGDOM_LEVEL = 70;

  static PHYLUM_LEVEL = 60;

  static SUBPHYLUM_LEVEL = 57;

  static SUPERCLASS_LEVEL = 53;

  static CLASS_LEVEL = 50;

  static SUBCLASS_LEVEL = 47;

  static INFRACLASS_LEVEL = 45;

  static SUBTERCLASS_LEVEL = 44;

  static SUPERORDER_LEVEL = 43;

  static ORDER_LEVEL = 40;

  static SUBORDER_LEVEL = 37;

  static INFRAORDER_LEVEL = 35;

  static PARVORDER_LEVEL = 34.5;

  static ZOOSECTION_LEVEL = 34;

  static ZOOSUBSECTION_LEVEL = 33.5;

  static SUPERFAMILY_LEVEL = 33;

  static EPIFAMILY_LEVEL = 32;

  static FAMILY_LEVEL = 30;

  static SUBFAMILY_LEVEL = 27;

  static SUPERTRIBE_LEVEL = 26;

  static TRIBE_LEVEL = 25;

  static SUBTRIBE_LEVEL = 24;

  static GENUS_LEVEL = 20;

  static GENUSHYBRID_LEVEL = 20;

  static SUBGENUS_LEVEL = 15;

  static SECTION_LEVEL = 13;

  static SUBSECTION_LEVEL = 12;

  static COMPLEX_LEVEL = 11;

  static SPECIES_LEVEL = 10;

  static HYBRID_LEVEL = 10;

  static SUBSPECIES_LEVEL = 5;

  static VARIETY_LEVEL = 5;

  static FORM_LEVEL = 5;

  static INFRAHYBRID_LEVEL = 5;

  static mimicRealmMappedPropertiesSchema( taxon ) {
    return {
      ...taxon,
      default_photo: Photo.mapApiToRealm( taxon?.default_photo ),
      preferredCommonName: taxon.preferred_common_name
    };
  }

  static mapApiToRealm( taxon, _realm = null ) {
    return {
      ...taxon,
      id: Number( taxon.id ),
      default_photo: Photo.mapApiToRealm( taxon?.default_photo )
    };
  }

  static uri = item => ( item && item.default_photo ) && { uri: item.default_photo.url };

  static schema = {
    name: "Taxon",
    primaryKey: "id",
    properties: {
      id: "int",
      default_photo: {
        type: "object",
        objectType: "Photo",
        mapTo: "defaultPhoto",
        optional: true
      },
      name: "string?",
      preferred_common_name: {
        type: "string",
        mapTo: "preferredCommonName",
        optional: true
      },
      rank: "string?",
      rank_level: "float?",
      isIconic: "bool?",
      iconic_taxon_name: "string?",
      ancestor_ids: "int[]",
      _synced_at: "date?"
    }
  };
}

export default Taxon;
