import { cryptoUtil } from 'core-roblox-utilities';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CurrentUser } from 'Roblox';
import { Grid } from '@mui/material';
import '../../../../css/sendrNotificationStream/sendrNotificationStream.scss';
import { DialogActions, DialogContent, DialogTitle } from '../../styledMuiComponents';
import AbuseReportForm from '../abuseReport/AbuseReportForm';
import {
  AbuseReportCustomRenderFn,
  AbuseReportFormAction,
  AbuseReportFormData,
  AbuseReportFormSubmitAction,
  ReportedEntity
} from '../abuseReport/abuseReportFormType';
import { useNotificationLocalization } from '../context/NotificationsLocalization';
import { useSelectedNotification } from '../context/SelectedNotification';
import {
  reportNotification,
  sendEventStreamEvent,
  getReportAbuseConfig
} from '../services/NotificationStreamService';
import { getIdempotenceKeyFromState } from '../utils/metaActionsUtils';
import NotificationView from './NotificationView';
import NOTIFICATION_EVENTS from '../constants/eventConstants';
import urlConstants from '../constants/urlConstants';

export type ReportNotificationModalProps = {
  handleClose: (reportSubmitted: boolean) => void;
};

const ReportNotificationModalContent: FC<ReportNotificationModalProps> = ({ handleClose }) => {
  const translate = useNotificationLocalization();
  const { displayState: notificationProps, notificationData } = useSelectedNotification();
  const formActions: AbuseReportFormAction[] = useMemo(
    () => [
      {
        id: 'cancelModal',
        label: translate('Action.Cancel'),
        classes: 'btn-secondary-lg',
        action: () => {
          sendEventStreamEvent(NOTIFICATION_EVENTS.ReportNotificationCancelled, 'click', {
            sendrVersion: notificationData?.content.minVersion?.toString() ?? '',
            notifType: notificationData?.content.notificationType ?? '',
            notifId: notificationData?.id ?? ''
          });
          handleClose(false);
        }
      }
    ],
    [handleClose, translate, notificationData]
  );
  const [idempotenceKey, setIdempotenceKey] = useState<string>('');
  const generateIdempotenceKey = useCallback(async () => {
    const key = getIdempotenceKeyFromState(notificationProps?.currentState);
    const keyWithDate = `${key}${new Date().toDateString()}`.split(' ').join('');
    const hashedKey = await cryptoUtil.hashStringWithSha256(keyWithDate);
    setIdempotenceKey(hashedKey);
  }, [notificationProps]);

  const [apiErrorMsg, setApiErrorMsg] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    generateIdempotenceKey();
    sendEventStreamEvent(NOTIFICATION_EVENTS.ReportNotificationLoaded, 'load', {
      sendrVersion: notificationData?.content.minVersion.toString() ?? '',
      notifType: notificationData?.content.notificationType ?? '',
      notifId: notificationData?.id ?? ''
    });
  }, []);

  const [showEuDsa, setEuDsa] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    const getUiConfig = async () => {
      try {
        setEuDsa(false);
        const result = await getReportAbuseConfig();
        if (!ignore) {
          setEuDsa(result.data.displayDsaLink);
        }
      } catch (error) {
        // Do nothing, already set to false
      }
    };
    // eslint-disable-next-line no-void
    void getUiConfig();
    return () => {
      ignore = true;
    };
  }, []);

  const reportedNotification = useMemo(
    () => (notificationProps ? <NotificationView {...notificationProps} isReadOnly /> : null),
    [notificationProps]
  );

  const reportedData: ReportedEntity = useMemo(
    () => ({
      key: 'NOTIFICATION_ID',
      id: notificationData?.id ?? '',
      type: 'notifications',
      idempotenceKey
    }),
    [notificationData?.id, idempotenceKey]
  );

  const onReportSubmit = useCallback(
    async (data: AbuseReportFormData) => {
      sendEventStreamEvent(NOTIFICATION_EVENTS.ReportNotificationSubmit, 'click', {
        sendrVersion: notificationData?.content.minVersion?.toString() ?? '',
        notifType: notificationData?.content.notificationType ?? '',
        notifId: notificationData?.id ?? '',
        ReportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY
      });
      try {
        await reportNotification(notificationData?.id);
        sendEventStreamEvent(NOTIFICATION_EVENTS.ReportNotificationSubmitSuccess, 'click', {
          sendrVersion: notificationData?.content.minVersion?.toString() ?? '',
          notifType: notificationData?.content.notificationType ?? '',
          notifId: notificationData?.id ?? '',
          ReportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY
        });

        handleClose(true);
      } catch (e) {
        sendEventStreamEvent(NOTIFICATION_EVENTS.ReportNotificationSubmitFailed, 'click', {
          sendrVersion: notificationData?.content.minVersion?.toString() ?? '',
          notifType: notificationData?.content.notificationType ?? '',
          notifId: notificationData?.id ?? '',
          ReportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY
        });
        setApiErrorMsg((e as Error).message ?? '');
      }
    },
    [notificationData, handleClose]
  );

  const reportAction: AbuseReportFormSubmitAction = useMemo(
    () => ({
      sequence: 'async',
      action: onReportSubmit
    }),
    [onReportSubmit]
  );

  const renderProp: AbuseReportCustomRenderFn = useCallback(
    (body, actionsButtons) => {
      return (
        <React.Fragment>
          <DialogTitle>{translate('Title.ReportNotification')}</DialogTitle>
          <DialogContent>
            <Grid item xs={12} classes={{ root: 'reported-notification' }}>
              {reportedNotification}
            </Grid>
            {body}
          </DialogContent>
          {apiErrorMsg ? (
            <Grid item xs={12} classes={{ root: 'text-error notification-api-error' }}>
              {translate(apiErrorMsg)}
            </Grid>
          ) : null}
          <DialogActions>{actionsButtons}</DialogActions>
          {showEuDsa ? (
            <Grid item xs={12} classes={{ root: 'report-eu-dsa-text' }}>
              <a
                href={urlConstants.illegalContentReportingUrl}
                className='text-link'
                target='_blank'
                rel='noreferrer'>
                {translate('DSAIllegal.ReportLink')}
              </a>
            </Grid>
          ) : null}
        </React.Fragment>
      );
    },
    [apiErrorMsg, translate, reportedNotification, showEuDsa]
  );

  return (
    <AbuseReportForm
      reportedEntity={reportedData}
      reporterId={CurrentUser.userId}
      formActions={formActions}
      onSubmit={reportAction}
      customRender={renderProp}
    />
  );
};

export default ReportNotificationModalContent;
