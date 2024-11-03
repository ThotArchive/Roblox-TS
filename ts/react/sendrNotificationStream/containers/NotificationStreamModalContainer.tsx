import { StyledEngineProvider } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import MetaActionsList from '../components/MetaActionsList';
import ReportNotificationModal from '../components/ReportNotificationModal';
import { NotificationLocalizationProvider } from '../context/NotificationsLocalization';
import {
  SelectedNotificationState,
  useSelectedNotificationProvider
} from '../context/SelectedNotification';

const NotificationStreamModalContainer = (): JSX.Element => {
  const {
    SelectedNotificationProvider,
    setSelectedNotification
  } = useSelectedNotificationProvider();
  const [metaActionsVisible, setMetaActionsVisible] = useState(false);
  const [showReportNotification, setShowReportNotification] = useState(false);
  const openMetaActionsList = useCallback(
    (event: CustomEvent<SelectedNotificationState>): void => {
      setSelectedNotification(event.detail);
      setMetaActionsVisible(true);
    },
    [setSelectedNotification, setMetaActionsVisible]
  );

  const closeMetaActionsList = useCallback(() => {
    setMetaActionsVisible(false);
  }, []);

  useEffect(() => {
    window.addEventListener('setMetaActionsList', openMetaActionsList as EventListener);
    return () => {
      window.removeEventListener('setMetaActionsList', openMetaActionsList as EventListener);
    };
  }, [openMetaActionsList]);

  const showAbuseReport = useCallback(() => setShowReportNotification(true), [
    setShowReportNotification
  ]);

  const closeAbuseReport = useCallback(() => setShowReportNotification(false), [
    setShowReportNotification
  ]);

  return (
    <StyledEngineProvider injectFirst>
      <NotificationLocalizationProvider>
        <SelectedNotificationProvider>
          <MetaActionsList
            show={metaActionsVisible}
            closeModal={closeMetaActionsList}
            showAbuseReport={showAbuseReport}
          />
          <ReportNotificationModal isOpen={showReportNotification} closeModal={closeAbuseReport} />
        </SelectedNotificationProvider>
      </NotificationLocalizationProvider>
    </StyledEngineProvider>
  );
};

export default NotificationStreamModalContainer;
