// @flow

import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";

import { View } from "../../styledComponents";
import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

type Props = {
  numOfUnuploadedObs: number,
  isLoggedIn: ?boolean,
  translateY: any,
  isExplore: boolean,
  syncObservations: Function,
  setView: Function
}

const ObsListHeader = ( {
  numOfUnuploadedObs, isLoggedIn, translateY, isExplore, syncObservations, setView
}: Props ): Node => {
  if ( isLoggedIn === null ) {
    return <View className="rounded-bl-3xl rounded-br-3xl bg-primary" />;
  }

  return (
    // $FlowIgnore
    <Animated.View style={[{ transform: [{ translateY }] }]}>
      <View className="rounded-bl-3xl rounded-br-3xl bg-primary">
        {isLoggedIn
          ? <UserCard />
          : <LoggedOutCard numOfUnuploadedObs={numOfUnuploadedObs} />}
      </View>
      <Toolbar
        isExplore={isExplore}
        isLoggedIn={isLoggedIn}
        syncObservations={syncObservations}
        setView={setView}
      />
    </Animated.View>
  );
};

export default ObsListHeader;
