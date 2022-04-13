// @flow

import React, { useContext, useEffect } from "react";
import type { Node } from "react";
import { Pressable, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import UserCard from "./UserCard";
import { useCurrentUser } from "./hooks/useCurrentUser";
import BottomModal from "../SharedComponents/BottomModal";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import uploadObservation from "../ObsEdit/helpers/uploadObservation";

const ObsList = ( ): Node => {
  const { params } = useRoute( );
  const { observationList, loading, syncObservations, fetchNextObservations, obsToUpload } = useContext( ObservationContext );

  const id = params && params.userId;

  useEffect( ( ) => {
    // start fetching data immediately after successful login
    if ( params && params.syncData && params.userLogin ) {
      syncObservations( params.userLogin );
    }
  }, [params, syncObservations] );

  const userId = useCurrentUser( );

  const renderUploadModal = ( ) => {
    const uploadObservations = ( ) => obsToUpload.forEach( obs => {
      console.log( obs, "observation in upload modal" );
      // uploadObservation( obs );
    } );

    return (
      <>
        <Text>Whenever you get internet connection, you can sync your observations to iNaturalist.</Text>
        <RoundGreenButton
          buttonText="Upload-X-Observations"
          count={obsToUpload.length}
          handlePress={uploadObservations}
          testID="ObsList.uploadButton"
        />
      </>
    );
  };

  return (
    <ViewWithFooter>
      <UserCard userId={userId || id} />
      <Pressable onPress={syncObservations}>
        <Text>sync</Text>
      </Pressable>
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
        handleEndReached={fetchNextObservations}
      />
      {obsToUpload.length > 0 && (
        <BottomModal height={200}>
          {renderUploadModal( )}
        </BottomModal>
      )}
    </ViewWithFooter>
  );
};

export default ObsList;
