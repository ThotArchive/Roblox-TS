import EventTimer from '../../../../common/eventTimer';
import RobloxEventTracker from '../../../../common/eventTracker';
import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { FUNCAPTCHA_VERSION_V2, METRICS_CONSTANTS } from '../app.config';
import { ActionType } from '../interface';

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  private actionType: ActionType;

  private applicationType: string | null;

  private eventTimer: EventTimer;

  private provider: string;

  private requestServiceDefault: RequestServiceDefault;

  private solveTimeSequenceName: string;

  constructor(
    actionType: ActionType,
    provider: string,
    applicationType: string | null,
    requestServiceDefault: RequestServiceDefault
  ) {
    this.applicationType = applicationType;
    this.requestServiceDefault = requestServiceDefault;
    this.actionType = actionType;
    this.eventTimer = new EventTimer();
    this.provider = provider;
    this.solveTimeSequenceName = `${this.actionType}${this.provider}_${METRICS_CONSTANTS.sequence.solveTime}`;
  }

  fireTriggeredEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.triggered);
    if (RobloxEventTracker) {
      RobloxEventTracker.start(this.appendApplicationType(this.solveTimeSequenceName));
    }
    this.eventTimer.start(this.solveTimeSequenceName);
  }

  fireInitializedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.initialized);
  }

  fireMetadataErrorEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.metadataError);
  }

  fireSuppressedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.suppressed);
  }

  fireDisplayedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.displayed);
  }

  fireProviderErrorEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.providerError);
  }

  fireSuccessEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.success);
    if (RobloxEventTracker) {
      RobloxEventTracker.endSuccess(this.appendApplicationType(this.solveTimeSequenceName));
    }
    const eventTime = this.eventTimer.end(this.solveTimeSequenceName);
    if (eventTime === null) {
      return;
    }
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.SolveTimeCaptcha,
        value: eventTime,
        labelValues: {
          action_type: this.actionType,
          event_type: `${this.provider}_${METRICS_CONSTANTS.event.success}`,
          application_type: this.applicationType || 'unknown',
          version: FUNCAPTCHA_VERSION_V2
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireEvent(metricName: string): void {
    if (RobloxEventTracker) {
      const eventName = `${this.actionType}${this.provider}_${metricName}`;
      RobloxEventTracker.fireEvent(this.appendApplicationType(eventName));
    }
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventCaptcha,
        value: 1,
        labelValues: {
          action_type: this.actionType,
          event_type: `${this.provider}_${metricName}`,
          application_type: this.applicationType || 'unknown',
          version: FUNCAPTCHA_VERSION_V2
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  appendApplicationType(eventName: string): string {
    if (this.applicationType) {
      return `${eventName}_${this.applicationType}`;
    }
    return eventName;
  }
}

/**
 * An interface encapsulating the metrics fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * metrics service.
 */
export type MetricsService = {
  [K in keyof MetricsServiceDefault]: MetricsServiceDefault[K];
};
