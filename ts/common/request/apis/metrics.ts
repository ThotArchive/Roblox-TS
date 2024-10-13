/* eslint-disable import/prefer-default-export */

import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Metrics from '../types/metrics';

export const recordMetric = (
  metric: Metrics.Metric
): Promise<Result<void, Metrics.MetricsError | null>> =>
  toResult(httpService.post(Metrics.RECORD_METRICS_CONFIG, metric), Metrics.MetricsError);
