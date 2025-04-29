import { recordMetric } from '../../../../common/request/apis/metrics';
import { MetricName } from '../../../../common/request/types/metrics';
import { METRIC_CONSTANTS } from '../app.config';
import { ChallengeType } from '../interface';

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  // eslint-disable-next-line class-methods-use-this
  fireSuccessEvent(challengeType: ChallengeType): void {
    recordMetric({
      name: MetricName.EventGeneric,
      value: 1,
      labelValues: {
        event_type: METRIC_CONSTANTS.event.success,
        challenge_type: challengeType
      }
    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  fireParseFailureEvent(): void {
    recordMetric({
      name: MetricName.EventGeneric,
      value: 1,
      labelValues: {
        event_type: METRIC_CONSTANTS.event.parseFailure,
        challenge_type: METRIC_CONSTANTS.unknown
      }
    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  fireRenderFailureEvent(challengeType: ChallengeType): void {
    recordMetric({
      name: MetricName.EventGeneric,
      value: 1,
      labelValues: {
        event_type: METRIC_CONSTANTS.event.renderFailure,
        challenge_type: challengeType
      }
    }) // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  fireContinueFailureEvent(challengeType: ChallengeType): void {
    recordMetric({
      name: MetricName.EventGeneric,
      value: 1,
      labelValues: {
        event_type: METRIC_CONSTANTS.event.continueFailure,
        challenge_type: challengeType
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
