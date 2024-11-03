import { eventStreamService } from 'core-roblox-utilities';
import { httpService } from 'core-utilities';
import { WithTranslationsProps } from 'react-utilities';
import {
  AbuseReportInputConfiguration,
  ReportedTags,
  SafetyEventResponse
} from './abuseReportFormType';
import { ABUSE_REASONS, REPORTER_COMMENT_LIMIT } from './constants/abuseReportConstants';
import url from './constants/urlConstants';

type TranslateFunction = WithTranslationsProps['translate'];

const sendReport = async (
  tags: ReportedTags,
  idempotencyKey?: string
): Promise<SafetyEventResponse> => {
  const data = {
    safetyEvent: {
      eventTime: Date.now(),
      idempotencyKey,
      tags
    }
  };
  const result = await httpService.post(url.safetyEvent, data);
  return result as SafetyEventResponse;
};

const getReportConfiguration = (translate: TranslateFunction): AbuseReportInputConfiguration[] => {
  return [
    {
      name: 'REPORTED_ABUSE_CATEGORY',
      type: 'select',
      initialValue: '',
      label: translate('Placeholder.ReasonAbuse'),
      validation: {
        required: true
      },
      options: [
        {
          label: translate('AbuseReason.Bullying'),
          value: ABUSE_REASONS.VIOLATION_TYPE_BULLYING_AND_HARASSMENT
        },
        {
          label: translate('AbuseReason.CheatingAndExploiting'),
          value: ABUSE_REASONS.VIOLATION_TYPE_CHEATING_AND_EXPLOITS
        },
        {
          label: translate('AbuseReason.Dating'),
          value: ABUSE_REASONS.VIOLATION_TYPE_DATING_AND_ROMANTIC
        },
        {
          label: translate('AbuseReason.DirectingOffPlatform'),
          value: ABUSE_REASONS.VIOLATION_TYPE_DIRECTING_USERS_OFF_PLATFORM
        },
        {
          label: translate('AbuseReason.Other'),
          value: ABUSE_REASONS.VIOLATION_TYPE_OTHER
        },
        {
          label: translate('AbuseReason.AskingPII'),
          value: ABUSE_REASONS.VIOLATION_TYPE_ASKING_FOR_PII
        },
        {
          label: translate('AbuseReason.Scamming'),
          value: ABUSE_REASONS.VIOLATION_TYPE_SCAMS
        },
        {
          label: translate('AbuseReason.Profanity'),
          value: ABUSE_REASONS.VIOLATION_TYPE_PROFANITY
        }
      ]
    },
    {
      name: 'REPORTER_COMMENT',
      type: 'textfield',
      initialValue: '',
      placeHolder: translate('Placeholder.ReasonDescription'),
      validation: {
        required: true,
        maxLength: REPORTER_COMMENT_LIMIT
      }
    }
  ];
};

const sendEventStreamEvent = (
  eventName: string,
  eventType: string,
  notificationParams: Record<string, string>
): void => {
  eventStreamService.sendEventWithTarget(eventName, eventType, notificationParams);
};

export { sendReport, getReportConfiguration, sendEventStreamEvent };
