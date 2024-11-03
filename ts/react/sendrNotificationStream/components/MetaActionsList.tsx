import {
  ReportProblemOutlined,
  NotificationsOutlined,
  NotificationsOffOutlined
} from '@mui/icons-material';
import React from 'react';
import eventConstants from '../constants/eventConstants';
import { useSelectedNotification } from '../context/SelectedNotification';
import {
  InteractibleVisualItem,
  VisualItemMetaAction,
  VisualItemType
} from '../types/NotificationTemplateTypes';
import isVisualItemAbuseReport from '../utils/isVisualItemAbuseReport';
import { formatText } from '../utils/labelUtils';

import NotificationView from './NotificationView';

export type MetaActionsListProps = {
  show: boolean;
  closeModal: () => void;
  showAbuseReport: () => void;
};

const metaActionIconMap: {
  [icon: string]: typeof ReportProblemOutlined | undefined;
} = {
  report: ReportProblemOutlined,
  turnOnNotifications: NotificationsOutlined,
  turnOffNotifications: NotificationsOffOutlined
};

export const MetaActionsListBase = ({
  show,
  closeModal,
  showAbuseReport
}: MetaActionsListProps): JSX.Element | null => {
  const { displayState: notificationProps, notificationData } = useSelectedNotification();

  if (!show || !notificationProps) {
    return null;
  }

  const handleMetaActions = (visualItem: InteractibleVisualItem): void => {
    if (isVisualItemAbuseReport(visualItem)) {
      notificationProps.handleEventStreamClickEvent(
        eventConstants.ReportNotificationOpen,
        visualItem.visualItemType,
        visualItem.clientEventsPayload,
        undefined,
        notificationData?.bundleIndex,
        notificationData?.bundleId
      );
      showAbuseReport();
    } else if (notificationProps?.handleActions) {
      notificationProps.handleActions(visualItem);
    }
    closeModal();
  };

  const toggleMetaActions = () => {
    notificationProps.handleEventStreamClickEvent(
      eventConstants.CloseMetaActionsEvent,
      VisualItemType.MetaActionsButton,
      undefined,
      undefined,
      notificationData?.bundleIndex,
      notificationData?.bundleId
    );
    closeModal();
  };

  const listElements: Array<JSX.Element> = [];
  const metaActions: Array<VisualItemMetaAction> =
    notificationProps.currentState.visualItems[VisualItemType.MetaAction] || [];
  for (let metaActionsIndex = 0; metaActionsIndex < metaActions.length; metaActionsIndex++) {
    const item = metaActions[metaActionsIndex];
    const ActionIconComponent = item.actionIcon && metaActionIconMap[item.actionIcon];
    if (listElements.length > 0) {
      listElements.push(<div className='rbx-divider' key={metaActionsIndex} />);
    }
    listElements.push(
      <button
        type='button'
        className='meta-action-button'
        key={item.label.text}
        onClick={e => {
          e.stopPropagation();
          handleMetaActions(item);
        }}>
        {ActionIconComponent ? (
          <React.Fragment>
            <ActionIconComponent />
            <span className='meta-action-button-text'>{formatText(item.label)}</span>
          </React.Fragment>
        ) : (
          formatText(item.label)
        )}
      </button>
    );
  }

  return (
    <div
      id='meta-actions-list-base'
      className='meta-actions-list-base'
      onClick={toggleMetaActions}
      role='none'>
      <NotificationView
        {...notificationProps}
        handleActions={handleMetaActions}
        toggleMetaActions={toggleMetaActions}
        isMetaActionsOverlay
      />
      <div className='meta-actions-overlay meta-action-button-group'>{listElements}</div>
    </div>
  );
};

export default MetaActionsListBase;
