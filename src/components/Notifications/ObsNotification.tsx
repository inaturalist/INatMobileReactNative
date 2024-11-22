import ObservationIcon from "components/Notifications/ObservationIcon.tsx";
import ObsNotificationText from "components/Notifications/ObsNotificationText.tsx";
import {
  Body4,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { formatDifferenceForHumans } from "sharedHelpers/dateAndTime.ts";
import { useTranslation } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

interface Props {
  notification: Notification
}

const ObsNotification = ( { notification }: Props ) => {
  const { i18n } = useTranslation( );
  const { notifier_type: type } = notification;
  const realm = useRealm( );

  const observation: RealmObservation | null = realm.objectForPrimaryKey(
    "Observation",
    notification.resource_uuid
  );
  const photoUrl = observation?.observationPhotos[0]?.photo?.url;
  const soundsUrl = observation?.observationSounds[0]?.sound?.file_url;

  const renderIcon = () => {
    switch ( type ) {
      case "Identification":
        return "label-outline";
      case "Comment":
        return "comments-outline";
      default:
        return "";
    }
  };
  return (
    <View
      className="shrink flex-row space-x-[10px]"
    >
      <ObservationIcon photoUri={photoUrl} soundUri={soundsUrl} />
      <View className="flex-col shrink justify-center space-y-[8px]">
        <ObsNotificationText notification={notification} />
        <View className="flex-row space-x-[8px]">
          {
            type
              && (
                <INatIcon
                  name={renderIcon( )}
                  size={14}
                  color={String( colors?.darkGray )}
                />
              )
          }
          {notification.created_at
            && (
              <Body4>
                {formatDifferenceForHumans( notification.created_at, i18n )}
              </Body4>
            )}
        </View>
      </View>
    </View>
  );
};

export default ObsNotification;
