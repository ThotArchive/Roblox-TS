type NotificationErrorCodes = 400 | 401 | 500 | 'default';

const reportNotificationErrorMessages: Partial<Record<NotificationErrorCodes, string>> = {
  401: 'Error.UnauthorizedUser.ReportNotification',
  500: 'Error.ServerError.ReportNotification',
  default: 'Error.Default'
};

export { NotificationErrorCodes, reportNotificationErrorMessages };
