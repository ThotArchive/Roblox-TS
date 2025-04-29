import EventTimer from '../../../../common/eventTimer';
import RobloxEventTracker from '../../../../common/eventTracker';
import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { FEATURE_NAME, METRICS_CONSTANTS } from '../app.config';
import { ActionType, MediaType } from '../interface';

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  private appType: string;

  private actionType: ActionType;

  private solveTimeSequenceName: string;

  private eventTimer: EventTimer;

  private requestServiceDefault: RequestServiceDefault;

  constructor(
    actionType: ActionType,
    appType: string | undefined,
    requestServiceDefault: RequestServiceDefault
  ) {
    this.appType = appType || 'unknown';
    this.actionType = actionType;
    this.solveTimeSequenceName = `${this.actionType}_${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.solveTime}`;
    this.eventTimer = new EventTimer();
    this.requestServiceDefault = requestServiceDefault;
  }

  fireInitializedEvent(): void {
    if (RobloxEventTracker) {
      const eventName = `${this.actionType}_${FEATURE_NAME}_${METRICS_CONSTANTS.event.initialized}`;
      RobloxEventTracker.fireEvent(eventName, `${eventName}_${this.appType}`);
      RobloxEventTracker.start(
        this.solveTimeSequenceName,
        `${this.solveTimeSequenceName}_${this.appType}`
      );
    }

    // New Prometheus-based metrics code:
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.Event2sv,
        value: 1,
        labelValues: {
          action_type: this.actionType,
          event_type: METRICS_CONSTANTS.event.initialized,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
    this.eventTimer.start(this.solveTimeSequenceName);
  }

  fireVerifiedEvent(mediaType: MediaType | null): void {
    if (mediaType === null) {
      return;
    }

    if (RobloxEventTracker) {
      const eventName = `${this.actionType}_${FEATURE_NAME}_${METRICS_CONSTANTS.event.verified}${mediaType}`;
      RobloxEventTracker.fireEvent(eventName, `${eventName}_${this.appType}`);
      RobloxEventTracker.endSuccess(
        this.solveTimeSequenceName,
        `${this.solveTimeSequenceName}_${this.appType}`
      );
    }

    // New Prometheus-based metrics code:
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.Event2sv,
        value: 1,
        labelValues: {
          action_type: this.actionType,
          event_type: `${METRICS_CONSTANTS.event.verified}${mediaType}`,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});

    const eventTime = this.eventTimer.end(this.solveTimeSequenceName);
    if (eventTime === null) {
      return;
    }

    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.SolveTime2sv,
        value: eventTime,
        labelValues: {
          action_type: this.actionType,
          event_type: `${METRICS_CONSTANTS.event.verified}${mediaType}`,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireInvalidatedEvent(): void {
    if (RobloxEventTracker) {
      const eventName = `${this.actionType}_${FEATURE_NAME}_${METRICS_CONSTANTS.event.invalidated}`;
      RobloxEventTracker.fireEvent(eventName, `${eventName}_${this.appType}`);
      RobloxEventTracker.endFailure(
        this.solveTimeSequenceName,
        `${this.solveTimeSequenceName}_${this.appType}`
      );
    }

    // New Prometheus-based metrics code:
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.Event2sv,
        value: 1,
        labelValues: {
          action_type: this.actionType,
          event_type: METRICS_CONSTANTS.event.invalidated,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});

    const eventTime = this.eventTimer.end(this.solveTimeSequenceName);
    if (eventTime === null) {
      return;
    }

    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.SolveTime2sv,
        value: eventTime,
        labelValues: {
          action_type: this.actionType,
          event_type: METRICS_CONSTANTS.event.invalidated,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireAbandonedEvent(): void {
    if (RobloxEventTracker) {
      const eventName = `${this.actionType}_${FEATURE_NAME}_${METRICS_CONSTANTS.event.abandoned}`;
      RobloxEventTracker.fireEvent(eventName, `${eventName}_${this.appType}`);
      RobloxEventTracker.endCancel(
        this.solveTimeSequenceName,
        `${this.solveTimeSequenceName}_${this.appType}`
      );
    }

    // New Prometheus-based metrics code:
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.Event2sv,
        value: 1,
        labelValues: {
          action_type: this.actionType,
          event_type: METRICS_CONSTANTS.event.abandoned,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});

    const eventTime = this.eventTimer.end(this.solveTimeSequenceName);
    if (eventTime === null) {
      return;
    }

    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.SolveTime2sv,
        value: eventTime,
        labelValues: {
          action_type: this.actionType,
          event_type: METRICS_CONSTANTS.event.abandoned,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
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
