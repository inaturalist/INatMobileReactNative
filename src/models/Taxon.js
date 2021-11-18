class Taxon {
  static createObjectForRealm( taxon ) {
    return {
      defaultPhotoSquareUrl: taxon.default_photo.square_url,
      id: taxon.id,
      name: taxon.name,
      preferredCommonName: taxon.preferred_common_name,
      rank: taxon.rank
    };
  }

  static schema = {
    name: "Taxon",
    properties: {
      id: "int",
      defaultPhotoSquareUrl: "string?",
      name: "string?",
      preferredCommonName: "string?",
      rank: "string?"
    }
  }
}

export default Taxon;
