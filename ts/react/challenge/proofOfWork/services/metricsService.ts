import EventTimer from '../../../../common/eventTimer';
import RobloxEventTracker from '../../../../common/eventTracker';
import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { FEATURE_NAME, METRICS_CONSTANTS } from '../app.config';

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  private appType: string;

  private challengeSolveTimeSequenceName: string;

  private puzzleWorkingTimeSequenceName: string;

  private eventTimer: EventTimer;

  private requestServiceDefault: RequestServiceDefault;

  constructor(appType: string | undefined, requestServiceDefault: RequestServiceDefault) {
    this.appType = appType || 'unknown';
    this.requestServiceDefault = requestServiceDefault;
    this.eventTimer = new EventTimer();
    this.challengeSolveTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.challengeSolveTime}`;
    this.puzzleWorkingTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.puzzleWorkingTime}`;
  }

  fireChallengeInitializedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInitialized);
    if (RobloxEventTracker) {
      RobloxEventTracker.start(
        this.challengeSolveTimeSequenceName,
        `${this.challengeSolveTimeSequenceName}_${this.appType}`
      );
    }
    this.eventTimer.start(this.challengeSolveTimeSequenceName);
  }

  firePuzzleInitializedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.puzzleInitialized);
    if (RobloxEventTracker) {
      RobloxEventTracker.start(
        this.puzzleWorkingTimeSequenceName,
        `${this.puzzleWorkingTimeSequenceName}_${this.appType}`
      );
    }
    this.eventTimer.start(this.puzzleWorkingTimeSequenceName);
  }

  firePuzzleCompletedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.puzzleCompleted);
    if (RobloxEventTracker) {
      RobloxEventTracker.endSuccess(
        this.puzzleWorkingTimeSequenceName,
        `${this.puzzleWorkingTimeSequenceName}_${this.appType}`
      );
    }
    const eventTime = this.eventTimer.end(this.puzzleWorkingTimeSequenceName);
    if (eventTime !== null) {
      this.requestServiceDefault.metrics
        .recordMetric({
          name: MetricName.PuzzleComputeTimePow,
          value: eventTime,
          labelValues: {
            event_type: `${FEATURE_NAME}_${METRICS_CONSTANTS.event.puzzleCompleted}`,
            application_type: this.appType
          }
        })
        // Swallow errors if metrics failed to send; this should not be fatal.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
  }

  fireChallengeCompletedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeCompleted);
    if (RobloxEventTracker) {
      RobloxEventTracker.endSuccess(
        this.challengeSolveTimeSequenceName,
        `${this.challengeSolveTimeSequenceName}_${this.appType}`
      );
    }
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeCompleted);
  }

  fireChallengeInvalidatedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInvalidated);
    if (RobloxEventTracker) {
      RobloxEventTracker.endFailure(
        this.challengeSolveTimeSequenceName,
        `${this.challengeSolveTimeSequenceName}_${this.appType}`
      );
    }
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeInvalidated);
  }

  fireChallengeAbandonedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeAbandoned);
    if (RobloxEventTracker) {
      RobloxEventTracker.endCancel(
        this.challengeSolveTimeSequenceName,
        this.puzzleWorkingTimeSequenceName,
        `${this.challengeSolveTimeSequenceName}_${this.appType}`,
        `${this.puzzleWorkingTimeSequenceName}_${this.appType}`
      );
    }
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeAbandoned);
  }

  fireChallengeTimeoutEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeTimeout);
    if (RobloxEventTracker) {
      RobloxEventTracker.endFailure(
        this.challengeSolveTimeSequenceName,
        `${this.challengeSolveTimeSequenceName}_${this.appType}`
      );
    }
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeTimeout);
  }

  fireEvent(metricName: string): void {
    if (RobloxEventTracker) {
      const eventName = `${FEATURE_NAME}_${metricName}`;
      RobloxEventTracker.fireEvent(eventName, `${eventName}_${this.appType}`);
    }
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventPow,
        value: 1,
        labelValues: {
          event_type: `${FEATURE_NAME}_${metricName}`,
          application_type: this.appType
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireSolveTimeEvent(metricName: string): void {
    const eventTime = this.eventTimer.end(this.challengeSolveTimeSequenceName);
    if (eventTime !== null) {
      this.requestServiceDefault.metrics
        .recordMetric({
          name: MetricName.SolveTimePow,
          value: eventTime,
          labelValues: {
            event_type: `${FEATURE_NAME}_${metricName}`,
            application_type: this.appType
          }
        })
        // Swallow errors if metrics failed to send; this should not be fatal.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
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
