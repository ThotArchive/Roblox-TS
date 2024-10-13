import { EnvironmentUrls } from 'Roblox';
import UrlConfig from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/http/interfaces/UrlConfig';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountSecurityServiceUrl = `${apiGatewayUrl}/account-security-service`;

export enum MetricsError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  INVAID_METRIC_NAME = 3,
  INVALID_METRIC_LABELS = 4
}

export enum MetricName {
  Event2sv = 'event_2sv',
  SolveTime2sv = 'solve_time_2sv',
  EventCaptcha = 'event_captcha',
  SolveTimeCaptcha = 'solve_time_captcha',
  EventPat = 'event_pat',
  SolveTimePat = 'solve_time_pat',
  EventPos = 'event_pos',
  PuzzleComputeTimePos = 'puzzle_compute_time_pos',
  SolveTimePos = 'solve_time_pos',
  EventPow = 'event_pow',
  PuzzleComputeTimePow = 'puzzle_compute_time_pow',
  SolveTimePow = 'solve_time_pow',
  EventRostile = 'event_rostile',
  SolveTimeRostile = 'solve_time_rostile',
  EventSecurityQuestion = 'event_security_question',
  EventGeneric = 'event_generic',
  EventReauthentication = 'event_reauthentication',
  SolveTimeReauthentication = 'solve_time_reauthentication',
  EventDeviceIntegrity = 'event_device_integrity',
  SolveTimeDeviceIntegrity = 'solve_time_device_integrity',
  EventPhoneVerification = 'event_phone_verification',
  SolveTimePhoneVerification = 'solve_time_phone_verification',
  EventEmailVerification = 'event_email_verification',
  SolveTimeEmailVerification = 'solve_time_email_verification'
}

export type Metric =
  | {
      name: MetricName.Event2sv;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        action_type: string;
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTime2sv;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        action_type: string;
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventCaptcha;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        action_type: string;
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
        // eslint-disable-next-line camelcase
        version: string;
      };
    }
  | {
      name: MetricName.SolveTimeCaptcha;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        action_type: string;
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
        // eslint-disable-next-line camelcase
        version: string;
      };
    }
  | {
      name: MetricName.EventPat;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimePat;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventPos;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.PuzzleComputeTimePos;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimePos;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventPow;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.PuzzleComputeTimePow;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimePow;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventRostile;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
        // `puzzle_type` is the challenge type (visible, invisible)
        // eslint-disable-next-line camelcase
        puzzle_type: string;
      };
    }
  | {
      name: MetricName.SolveTimeRostile;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
        // `puzzle_type` is the challenge type (visible, invisible)
        // eslint-disable-next-line camelcase
        puzzle_type: string;
      };
    }
  | {
      name: MetricName.EventSecurityQuestion;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventGeneric;
      value: number;
      labelValues: {
        // `challenge_type` is the name of the GCS challenge (e.g.
        // `twostepverification`).
        // eslint-disable-next-line camelcase
        challenge_type: string;
        // `event_type` is the event we are recording (e.g. `RenderFailure`).
        // eslint-disable-next-line camelcase
        event_type: string;
      };
    }
  | {
      name: MetricName.EventReauthentication;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `reauthentication_type` is the type of reauthentication (OTP_EMAIL, PASSWORD)
        // eslint-disable-next-line camelcase
        reauthentication_type: string;
      };
    }
  | {
      name: MetricName.SolveTimeReauthentication;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // eslint-disable-next-line camelcase
        reauthentication_type: string;
      };
    }
  | {
      name: MetricName.EventDeviceIntegrity;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimeDeviceIntegrity;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventPhoneVerification;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimePhoneVerification;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.EventEmailVerification;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    }
  | {
      name: MetricName.SolveTimeEmailVerification;
      value: number;
      labelValues: {
        // eslint-disable-next-line camelcase
        event_type: string;
        // `application_type` is the app type of the client
        // such as iOS, Android, etc.
        // eslint-disable-next-line camelcase
        application_type: string;
      };
    };

/**
 * Request Type: `POST`.
 */
export const RECORD_METRICS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSecurityServiceUrl}/v1/metrics/record`,
  timeout: 10000
};
