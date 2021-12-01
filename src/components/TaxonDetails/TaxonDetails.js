// @flow

import * as React from "react";
import { Text, View, Pressable, useWindowDimensions, Linking, ActivityIndicator } from "react-native";
import HTML from "react-native-render-html";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import PhotoScroll from "../ObsDetails/PhotoScroll";
import { viewStyles, textStyles } from "../../styles/taxonDetails";
import { useFetchTaxonDetails } from "./hooks/fetchTaxonDetails";
import { ScrollView } from "react-native-gesture-handler";

const TaxonDetails = ( ): React.Node => {
  const { params } = useRoute( );
  const { id } = params;
  const { taxon, loading } = useFetchTaxonDetails( id );
  // const similarSpecies = useFetchSimilarSpecies( id );
  const { width } = useWindowDimensions( );

  const displayTaxonomyList = React.useMemo( ( ) => {
    if ( !taxon || taxon.ancestors.length === 0 ) { return; }
    return taxon.ancestors.map( ( ancestor, i ) => {
      const addIndent = index => index * 5;
      const currentTaxon = `${taxon.preferred_common_name} (${taxon.name})`;
      // TODO: make sure this design accounts for undefined common names
      const formattedAncestor = ancestor.preferred_common_name
        ? `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`
        : `(${ancestor.rank} ${ancestor.name})`;
      const displayAncestor = <Text style={{ marginLeft: addIndent( i ) }}>{formattedAncestor}</Text>;
      const displayTaxon = <Text style={{ marginLeft: addIndent( i + 1 ) }}>{currentTaxon}</Text>;

      const lastAncestor = i === taxon.ancestors.length - 1;

      return (
        <View key={lastAncestor ? taxon.id : ancestor.id}>
          {displayAncestor}
          {lastAncestor && displayTaxon}
        </View>
      );
    } );
  }, [taxon] );

  if ( loading ) { return <ActivityIndicator />; }
  if ( !taxon ) { return null; }

  const openWikipedia = ( ) => Linking.openURL( taxon.wikipedia_url );

  return (
    <ViewWithFooter>
      <ScrollView
        contentContainerStyle={viewStyles.scrollView}
        testID={`TaxonDetails.${taxon.id}`}
      >
        <View style={viewStyles.photoContainer}>
          <PhotoScroll photos={taxon.taxonPhotos} />
        </View>
        <View style={viewStyles.textContainer}>
          <Text>{taxon.rank}</Text>
          <Text>{taxon.preferred_common_name}</Text>
          <Text>{taxon.name}</Text>
          <Text style={textStyles.header}>ABOUT</Text>
          <HTML
            contentWidth={width}
            source={{ html: taxon.wikipedia_summary }}
          />
          <Pressable onPress={openWikipedia}>
            <Text style={textStyles.header}>Read more on Wikipedia</Text>
          </Pressable>
          <Text style={textStyles.header}>TAXONOMY</Text>
          {displayTaxonomyList}
          <Text style={textStyles.header}>STATUS</Text>
          <Text style={textStyles.header}>SIMILAR SPECIES</Text>
        </View>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default TaxonDetails;

