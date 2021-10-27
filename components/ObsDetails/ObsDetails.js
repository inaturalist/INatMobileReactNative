// @flow


import React, { useState } from "react";
import { Text, View, Image, Pressable } from "react-native";
import type { Node } from "react";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ScrollView } from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/core";

import { viewStyles, textStyles } from "../../styles/obsDetails";
import useFetchObsDetails from "./hooks/fetchObsDetails";
import ActivityTab from "./ActivityTab";
import SmallUserIcon from "./SmallUserIcon";
import PhotoScroll from "./PhotoScroll";

const ObsDetails = ( ): Node => {
  const [tab, setTab] = useState( 0 );

  const { params } = useRoute( );
  const observation = params.observation;
  console.log( observation.uuid, "uuid in details" );
  const { ids, photos } = useFetchObsDetails( observation.uuid );

  const showActivityTab = ( ) => setTab( 0 );
  const showDataTab = ( ) => setTab( 1 );

  return (
    <ViewWithFooter>
      <ScrollView>
      <View style={viewStyles.userProfileRow}>
        <View style={viewStyles.userProfileRow}>
          <SmallUserIcon uri={observation.userProfilePhoto} />
          <Text>{`@${observation.userLogin}`}</Text>
        </View>
        <Text>{observation.createdAt}</Text>
      </View>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={photos} />
      </View>
      <View style={viewStyles.row}>
        <Image source={{ uri: observation.userPhoto }} style={viewStyles.imageBackground} />
        <View style={viewStyles.obsDetailsColumn}>
          <Text style={textStyles.text}>{observation.taxonRank}</Text>
          <Text style={textStyles.commonNameText}>{observation.commonName}</Text>
          <Text style={textStyles.scientificNameText}>scientific name</Text>
        </View>
        <View>
          <Text style={textStyles.text}>{observation.identificationCount}</Text>
          <Text style={textStyles.text}>{observation.commentCount}</Text>
          <Text style={textStyles.text}>{observation.qualityGrade}</Text>
        </View>
      </View>
      <Text style={textStyles.locationText}>{observation.location}</Text>
      <View style={viewStyles.userProfileRow}>
        <Pressable
          onPress={showActivityTab}
        >
          <Text style={textStyles.greenButtonText}>ACTIVITY</Text>
        </Pressable>
        <Pressable
          onPress={showDataTab}
        >
          <Text style={textStyles.greenButtonText}>DATA</Text>
        </Pressable>
      </View>
      {tab === 0 ? (
        <>
          <ActivityTab ids={ids} />
        </>
      ) : (
        <>
          <Text>{observation.timeObservedAt}</Text>
          <Text>data: description, location map, date observed, date uploaded</Text>
          <Text>data: projects, annotations, obs fields, obs created using, copyright</Text>
          <Text>comment (edit)</Text>
          <Text>suggest id (edit)</Text>
        </>
      )}
      </ScrollView>
    </ViewWithFooter>
  );
};

export default ObsDetails;
