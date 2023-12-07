import { useNavigation } from "@react-navigation/native";
import { Button, Heading4, INatIconButton } from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";
import {
  ScrollView,
  View
} from "react-native";
import { useTranslation } from "sharedHooks";

type Props = {
  showModal: boolean,
  closeModal: Function
};

const ExploreFilters = ( { showModal, closeModal }: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation( );
  return (
    <Modal
      showModal={showModal}
      closeModal={closeModal}
      fullScreen
      modal={(
        <View className="flex-1 justify-center items-center bg-gray-900 bg-opacity-50">
          <View className="w-full h-full bg-white rounded-lg overflow-hidden">
            <ScrollView className="p-4">
              {/* Header */}
              {/* TODO: */}
              <INatIconButton
                accessibilityLabel={t( "Close" )}
                icon="close"
                onPress={closeModal}
                size={30}
              />

            </ScrollView>
          </View>
        </View>
      )}
    />
  );
};

export default ExploreFilters;
