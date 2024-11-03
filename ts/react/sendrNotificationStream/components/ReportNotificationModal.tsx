import React, { FC, useCallback, useState } from 'react';
import { DeviceMeta } from 'Roblox';
import { Dialog } from '../../styledMuiComponents';
import { useSelectedNotification } from '../context/SelectedNotification';
import isVisualItemAbuseReport from '../utils/isVisualItemAbuseReport';
import ReportNotificationModalContent from './ReportNotificationModalContent';

const ReportNotificationModal: FC<{
  isOpen: boolean;
  closeModal: () => void;
}> = ({ isOpen, closeModal }) => {
  const selectedNotification = useSelectedNotification();
  const [isOnPhone] = useState(() => {
    if (DeviceMeta) {
      const { isPhone } = DeviceMeta();
      return isPhone;
    }
    return false;
  });
  const handleCloseAbuseReport = useCallback(
    (reported: boolean) => {
      if (reported) {
        selectedNotification.displayState?.currentState.visualItems.metaAction?.forEach(
          metaAction => {
            if (
              isVisualItemAbuseReport(metaAction) &&
              selectedNotification.displayState?.handleActions
            ) {
              selectedNotification.displayState.handleActions(metaAction);
            }
          }
        );
      }
      closeModal();
    },
    [closeModal, selectedNotification]
  );

  // Preventing event propagation on modal events, so underlying modals do not close
  const stopPropagation = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    ev.stopPropagation();
    // Modal potentially has a URL link for EU DSA which we need to allow it to open a new tab
    if (!(ev.target instanceof HTMLAnchorElement)) {
      ev.preventDefault();
    }
  }, []);

  const onReportNotificationModalClose = useCallback(
    (event, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (reason === 'escapeKeyDown') {
        handleCloseAbuseReport(false);
      }
    },
    [handleCloseAbuseReport]
  );

  return (
    <Dialog
      maxWidth='md'
      onClose={onReportNotificationModalClose}
      open={isOpen}
      isPhone={isOnPhone}
      onClick={stopPropagation}
      className='report-notification-modal'>
      <ReportNotificationModalContent handleClose={handleCloseAbuseReport} />
    </Dialog>
  );
};

export default ReportNotificationModal;
