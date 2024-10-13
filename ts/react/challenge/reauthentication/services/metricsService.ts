import EventTimer from '../../../../common/eventTimer';
import { Optional } from '../../../../common/optional';
import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { FEATURE_NAME, METRICS_CONSTANTS } from '../app.config';
import { ReauthenticationType } from '../interface';

export class MetricsServiceDefault {
  private defaultType: ReauthenticationType;

  private solveTimeSequenceName: string;

  private eventTimer: EventTimer;

  private requestServiceDefault: RequestServiceDefault;

  constructor(
    defaultType: ReauthenticationType,
    requestServiceDefault: RequestServiceDefault,
    eventTimer: EventTimer | undefined = new EventTimer()
  ) {
    this.defaultType = defaultType;
    this.requestServiceDefault = requestServiceDefault;
    this.eventTimer = eventTimer;

    this.solveTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.solveTime}`;
  }

  fireInitializedEvent(): void {
    // eslint-disable-next-line no-void
    void this.requestServiceDefault.metrics.recordMetric({
      name: MetricName.EventReauthentication,
      value: 1,
      labelValues: {
        event_type: METRICS_CONSTANTS.event.initialized,
        reauthentication_type: this.defaultType
      }
    });
    this.eventTimer.start(this.solveTimeSequenceName);
  }

  fireVerifiedEvent(reauthenticationType: ReauthenticationType | null): void {
    // eslint-disable-next-line no-void
    void this.requestServiceDefault.metrics.recordMetric({
      name: MetricName.EventReauthentication,
      value: 1,
      labelValues: {
        event_type: METRICS_CONSTANTS.event.verified,
        reauthentication_type: reauthenticationType ?? 'unknown'
      }
    });
    Optional.map(Optional.of(this.eventTimer.end(this.solveTimeSequenceName)), eventTime => {
      // eslint-disable-next-line no-void
      void this.requestServiceDefault.metrics.recordMetric({
        name: MetricName.SolveTimeReauthentication,
        value: eventTime,
        labelValues: {
          event_type: METRICS_CONSTANTS.event.verified,
          reauthentication_type: reauthenticationType ?? 'unknown'
        }
      });
    });
  }

  fireInvalidatedEvent(reauthenticationType: ReauthenticationType | null): void {
    // eslint-disable-next-line no-void
    void this.requestServiceDefault.metrics.recordMetric({
      name: MetricName.EventReauthentication,
      value: 1,
      labelValues: {
        event_type: METRICS_CONSTANTS.event.invalidated,
        reauthentication_type: reauthenticationType ?? 'unknown'
      }
    });

    Optional.map(Optional.of(this.eventTimer.end(this.solveTimeSequenceName)), eventTime => {
      // eslint-disable-next-line no-void
      void this.requestServiceDefault.metrics.recordMetric({
        name: MetricName.SolveTimeReauthentication,
        value: eventTime,
        labelValues: {
          event_type: `${METRICS_CONSTANTS.event.invalidated}`,
          reauthentication_type: reauthenticationType ?? 'unknown'
        }
      });
    });
  }

  fireAbandonedEvent(reauthenticationType: ReauthenticationType | null): void {
    // eslint-disable-next-line no-void
    void this.requestServiceDefault.metrics.recordMetric({
      name: MetricName.EventReauthentication,
      value: 1,
      labelValues: {
        event_type: METRICS_CONSTANTS.event.abandoned,
        reauthentication_type: reauthenticationType ?? 'unknown'
      }
    });

    Optional.map(Optional.of(this.eventTimer.end(this.solveTimeSequenceName)), eventTime => {
      // eslint-disable-next-line no-void
      void this.requestServiceDefault.metrics.recordMetric({
        name: MetricName.SolveTimeReauthentication,
        value: eventTime,
        labelValues: {
          event_type: `${METRICS_CONSTANTS.event.abandoned}`,
          reauthentication_type: reauthenticationType ?? 'unknown'
        }
      });
    });
  }
}

/**
 * An interface encap sulating the metrics fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * metrics service.
 */
export type MetricsService = {
  [K in keyof MetricsServiceDefault]: MetricsServiceDefault[K];
};
