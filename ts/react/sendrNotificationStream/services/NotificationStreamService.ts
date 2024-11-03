import { httpService } from 'core-utilities';
import { AxiosPromise } from 'axios';
import { eventStreamService } from 'core-roblox-utilities';
import {
  NotificationActionApiResponse,
  ReportAbuseConfigResponse
} from '../types/NotificationTemplateTypes';
import urlConstants from '../constants/urlConstants';
import {
  NotificationErrorCodes,
  reportNotificationErrorMessages
} from '../constants/errorCodeConstants';

const updateNotificationAction = (
  streamId: string,
  actionId: string
): AxiosPromise<NotificationActionApiResponse> => {
  const urlConfig = {
    retryable: true,
    url: urlConstants.notificationActionUrl(streamId, actionId),
    withCredentials: true
  };
  return httpService.post<NotificationActionApiResponse>(urlConfig, {});
};

const reportNotification = (notificationId?: string): Promise<unknown> => {
  if (!notificationId) {
    throw Error('No Notification ID to report');
  }
  const body = {
    notificationId
  };
  return httpService.post(urlConstants.reportNotificationUrl, body).catch(err => {
    const errorCode = httpService.parseErrorCode(err) as NotificationErrorCodes;
    throw new Error(
      reportNotificationErrorMessages[errorCode] ?? reportNotificationErrorMessages.default
    );
  });
};

const getReportAbuseConfig = (): AxiosPromise<ReportAbuseConfigResponse> => {
  return httpService.get(urlConstants.reportAbuseUiConfigUrl);
};

const sendEventStreamEvent = (
  eventName: string,
  eventType: string,
  notificationParams: Record<string, string>
): void => {
  eventStreamService.sendEventWithTarget(eventName, eventType, notificationParams);
};

export { updateNotificationAction, reportNotification, sendEventStreamEvent, getReportAbuseConfig };
