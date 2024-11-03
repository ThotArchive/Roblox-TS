import React, { useEffect, useRef } from 'react';
import { Intl } from 'Roblox';

import {
  NotificationTemplateProps,
  VisualItemButton,
  VisualItemType,
  VisualItemText,
  VisualItemThumbnail
} from '../../types/NotificationTemplateTypes';
import ButtonRow from '../ButtonRow';
import NotificationThumbnail from '../NotificationThumbnail';

import { formatText } from '../../utils/labelUtils';

export const LegacyNotificationTemplate = ({
  currentState,
  eventTime,
  handleActions,
  toggleMetaActions,
  isMetaActionsOverlay,
  isReadOnly
}: NotificationTemplateProps): JSX.Element => {
  const { visualItems } = currentState;
  const thumbnailItem: VisualItemThumbnail | undefined = visualItems[VisualItemType.Thumbnail]?.[0];
  const textBodyItem: VisualItemText | null = visualItems[VisualItemType.TextBody]?.[0] || null;
  let eventTimeString;
  const hasMetaActions = visualItems[VisualItemType.MetaAction]?.[0];
  const textButtonItems: Array<VisualItemButton> = visualItems[VisualItemType.Button] || [];

  const baseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isMetaActionsOverlay && baseRef.current) {
      baseRef.current.focus();
    }
  }, [baseRef, isMetaActionsOverlay]);

  if (eventTime) {
    const dateTimeFormatter = new Intl().getDateTimeFormatter();
    eventTimeString = dateTimeFormatter.getFullDate(new Date(eventTime));
  }

  const handleBaseInteraction = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (textBodyItem && textBodyItem.actions && textBodyItem.actions.length > 0 && handleActions) {
      handleActions(textBodyItem);
    } else {
      // disallow clicking through the card on the meta actions list
      e.stopPropagation();
    }
  };

  return (
    <div className={`legacy-notif-base ${isMetaActionsOverlay ? 'meta-actions-overlay' : ''}`}>
      <button
        onClick={handleBaseInteraction}
        className={`notification-background-interaction ${
          isReadOnly || !textBodyItem?.actions || textBodyItem.actions.length === 0
            ? 'notification-background-unclickable'
            : ''
        }`}
        tabIndex={isReadOnly ? -1 : 0}
        type='button'
        aria-label={textBodyItem?.title?.text || 'Notification'}
        ref={baseRef}
      />
      <div className='notif-content-container'>
        <NotificationThumbnail thumbnailItem={thumbnailItem} />
        <div className='small text text-content'>
          {textBodyItem && textBodyItem.title && (
            <span className='notif-title-text text-emphasis'>{formatText(textBodyItem.title)}</span>
          )}
          {textBodyItem && textBodyItem.label && <span>{formatText(textBodyItem.label)}</span>}
          {eventTimeString && <span>{eventTimeString}</span>}
        </div>
        {hasMetaActions && !isReadOnly && (
          <button
            className='meta-actions-toggle'
            onClick={toggleMetaActions}
            type='button'
            aria-label='Notification options'>
            <span className={isMetaActionsOverlay ? 'icon-close' : 'icon-more-gray-vertical'} />
          </button>
        )}
      </div>
      {textButtonItems.length > 0 && !isReadOnly && (
        <ButtonRow buttonList={textButtonItems} handleActions={handleActions} />
      )}
    </div>
  );
};

export default LegacyNotificationTemplate;
