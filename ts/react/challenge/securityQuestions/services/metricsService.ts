import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { METRIC_CONSTANTS } from '../app.config';

/**
 * Props for Security Question's metrics class; currently varies by app type only.
 */
export type MetricsServiceDefaultProps = {
  appType: string | undefined;
  requestServiceDefault: RequestServiceDefault;
};

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  private readonly appType: string;

  private readonly requestServiceDefault: RequestServiceDefault;

  constructor({ appType, requestServiceDefault }: MetricsServiceDefaultProps) {
    this.appType = appType || 'unknown';
    this.requestServiceDefault = requestServiceDefault;
  }

  fireInitializedEvent(): void {
    // TODO: we should really address dangling promises by trying to use an
    // alternative method of submitting metrics (or logging an error to
    // something that's not the browser)
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventSecurityQuestion,
        value: 1,
        labelValues: {
          event_type: METRIC_CONSTANTS.event.initialized,
          application_type: this.appType
        }
      }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireErroredEvent(): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventSecurityQuestion,
        value: 1,
        labelValues: {
          event_type: METRIC_CONSTANTS.event.errored,
          application_type: this.appType
        }
      }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireSolvedEvent(): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventSecurityQuestion,
        value: 1,
        labelValues: {
          event_type: METRIC_CONSTANTS.event.solved,
          application_type: this.appType
        }
      }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireIncorrectEvent(): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventSecurityQuestion,
        value: 1,
        labelValues: {
          event_type: METRIC_CONSTANTS.event.incorrect,
          application_type: this.appType
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireFailedEvent(): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventSecurityQuestion,
        value: 1,
        labelValues: {
          event_type: METRIC_CONSTANTS.event.failed,
          application_type: this.appType
        }
      }) // eslint-disable-next-line @typescript-eslint/no-empty-function
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
