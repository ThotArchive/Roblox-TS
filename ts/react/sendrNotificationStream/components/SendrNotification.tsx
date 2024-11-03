import React, { useRef, useState } from 'react';
import { DeepLinkService } from 'Roblox';
import {
  sendEventStreamEvent,
  updateNotificationAction
} from '../services/NotificationStreamService';
import {
  ActionType,
  InteractibleVisualItem,
  NotificationContent,
  NotificationTemplateProps,
  SendrNotificationProps,
  VisualItemType
} from '../types/NotificationTemplateTypes';
import DeeplinkFailModal from './DeeplinkFailModal';
import eventConstants from '../constants/eventConstants';

import NotificationView from './NotificationView';

export const handleUpdateNotificationAction = async (
  streamId: string,
  actionId: string,
  updateNotificationContent: (newContent: NotificationContent) => void
): Promise<boolean> =>
  updateNotificationAction(streamId, actionId).then(
    response => {
      if (response.data.content) {
        updateNotificationContent(response.data.content);
      }
      return response.status === 200;
    },
    () => false
  );

export const SendrNotification = ({ notificationData }: SendrNotificationProps): JSX.Element => {
  const eventTime: string = notificationData.eventDate;

  const [content, setContent] = useState(notificationData.content);
  const [currentState, setCurrentState] = useState(content.currentState);
  const [dismissed, setDismissed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [showDeeplinkFailureModal, setShowDeeplinkFailureModal] = useState(false);
  const handlingActionsRef = useRef(false);

  const updateNotificationContent = (newContent: NotificationContent): void => {
    setContent(newContent);
    setCurrentState(newContent.currentState);
  };

  const handleEventStreamClickEvent = (
    eventName: string,
    visualItemType: VisualItemType,
    params?: Record<string, string>,
    visualItemName?: string,
    bundlePosition?: number,
    bundleId?: string
  ) => {
    sendEventStreamEvent(eventName, 'click', {
      ...params,
      sendrVersion: content.minVersion.toString(),
      notifType: content.notificationType,
      notifId: notificationData.id,
      visual_item_type: visualItemType,
      visual_item_name: visualItemName == null ? '' : visualItemName,
      bundlePosition: bundlePosition?.toString() ?? '',
      bundleId: bundleId ?? ''
    });
  };

  const handleActions = async (visualItem: InteractibleVisualItem) => {
    // Handle actions sequentially
    // If an action fails, stop processing and go to fallback state if provided
    // Blocks handling actions if an API call is in progress
    if (handlingActionsRef.current || !visualItem.actions) {
      return;
    }
    handlingActionsRef.current = true;

    if (visualItem.eventName) {
      handleEventStreamClickEvent(
        visualItem.eventName,
        visualItem.visualItemType,
        visualItem.clientEventsPayload,
        visualItem.visualItemName,
        notificationData.bundleIndex,
        notificationData.bundleId
      );
    }

    const { actions } = visualItem;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      let canContinue = true;

      switch (action.actionType) {
        case ActionType.Dismiss:
          setDismissed(true);
          if (
            notificationData.bundleIndex !== undefined &&
            notificationData.handleBundleDismiss !== undefined
          ) {
            notificationData.handleBundleDismiss(notificationData.bundleIndex);
          }
          break;
        case ActionType.Deeplink:
          if (action.path) {
            DeepLinkService.navigateToDeepLink(action.path).then(
              success => {
                if (!success) {
                  // Possibly a network failure on game join, retry once after a
                  // short delay
                  setTimeout(() => {
                    if (action.path) {
                      DeepLinkService.navigateToDeepLink(action.path).then(
                        retrySuccess => {
                          if (!retrySuccess) {
                            setShowDeeplinkFailureModal(true);
                          }
                        },
                        () => setShowDeeplinkFailureModal(true)
                      );
                    }
                  }, 2000);
                }
              },
              () => setShowDeeplinkFailureModal(true)
            );
          }
          break;
        case ActionType.NotificationAPI:
          if (action.path) {
            // We need to await this call so we can stop iteration if it fails
            // eslint-disable-next-line no-await-in-loop
            const actionSuccess: boolean = await handleUpdateNotificationAction(
              notificationData.id,
              action.path,
              updateNotificationContent
            );
            if (!actionSuccess) {
              if (action.fallbackState) {
                setCurrentState(action.fallbackState);
              }
              canContinue = false;
            }
          }
          break;
        default:
      }

      if (!canContinue) {
        break;
      }

      if (action.nextState) {
        setCurrentState(action.nextState);
      }
    }
    handlingActionsRef.current = false;
  };

  const state = content.states[currentState];

  const toggleMetaActions = () => {
    handleEventStreamClickEvent(
      eventConstants.OpenMetaActionsEvent,
      VisualItemType.MetaActionsButton,
      undefined,
      undefined,
      notificationData.bundleIndex
    );
    const displayState: NotificationTemplateProps = {
      currentState: state,
      eventTime,
      handleActions,
      handleEventStreamClickEvent,
      toggleMetaActions
    };
    const event = new CustomEvent('setMetaActionsList', {
      detail: {
        displayState,
        notificationData
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      onTransitionEnd={e => {
        // Removes the notification when the css transition has moved it out
        // We listen for right because that's the property adjusted to
        // slide the notification
        if (e.propertyName === 'right') {
          setRemoved(true);
        }
      }}
      className={`sendr-notification-background ${
        dismissed ? 'sendr-notification-dismissed' : 'sendr-notification-visible'
      }`}>
      <DeeplinkFailModal
        // TODO: Move DeeplinkFailModal out of this component into a high order
        // component that shares state across multiple notifications
        show={showDeeplinkFailureModal}
        closeCallback={() => setShowDeeplinkFailureModal(false)}
      />
      {!removed && state && (
        <NotificationView
          currentState={state}
          eventTime={eventTime}
          handleActions={handleActions}
          handleEventStreamClickEvent={handleEventStreamClickEvent}
          toggleMetaActions={toggleMetaActions}
          isReadOnly={notificationData.isReadOnly}
        />
      )}
    </div>
  );
};

export default SendrNotification;
