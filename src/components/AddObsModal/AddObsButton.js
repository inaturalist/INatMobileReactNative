// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import { Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import { t } from "i18next";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import * as React from "react";
import { log } from "sharedHelpers/logger";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const { isAllAddObsOptionsMode } = useLayoutPrefs( );
  const navigation = useNavigation( );
  React.useEffect( ( ) => {
    // don't remove this logger.info statement: it's used for internal
    // metrics. isAdvancedUser name is vestigial, changing it will make it
    // impossible to compare with older log data
    logger.info( `isAdvancedUser: ${isAllAddObsOptionsMode}` );
  }, [isAllAddObsOptionsMode] );

  const navAndCloseModal = ( screen, params ) => {
    const currentRoute = getCurrentRoute();
    if ( screen !== "ObsEdit" ) {
      resetObservationFlowSlice( );
    }

    // we need to reset the navigation stack whenever a user navigates from the AddObs wheel,
    // otherwise the user can end up closing out to a previous place in the stack, #1857
    navigation.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [
          {
            name: "NoBottomTabStackNavigator",
            state: {
              index: 0,
              routes: [
                {
                  name: screen,
                  params: { ...params, previousScreen: currentRoute }
                }
              ]
            }
          }
        ]
      } )
    );

    closeModal( );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AI" } ); };

  const addObsModal = <AddObsModal closeModal={closeModal} navAndCloseModal={navAndCloseModal} />;

  return (
    <>
      {/* match the animation timing on FadeInView.tsx */}
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={250}
        animationOutTiming={250}
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <GradientButton
        sizeClassName="w-[69px] h-[69px] mb-[5px]"
        onPress={isAllAddObsOptionsMode
          ? openModal
          : navToARCamera}
        accessibilityLabel={t( "Add-observations" )}
        accessibilityHint={isAllAddObsOptionsMode
          ? t( "Shows-observation-creation-options" )
          : t( "Opens-AI-camera" )}
        iconName={isAllAddObsOptionsMode && "plus"}
        iconSize={isAllAddObsOptionsMode && 31}
      />
    </>
  );
};

export default AddObsButton;
