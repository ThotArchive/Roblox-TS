import { httpService, BatchRequestFactory } from 'core-utilities';
import {
  getBatchMetricsUrl,
  Measure,
  MetricsResult,
  DefaultBatchSize,
  DefaultProcessBatchWaitTime,
  JsonData
} from './sharedConstants';
import metricsMetaData from './metricsMetaData';

const batchRequestFactory = new BatchRequestFactory<Measure, MetricsResult>();
let idCounter = 0;

const {
  performanceMetricsBatchWaitTime,
  performanceMetricsBatchSize
} = metricsMetaData.getMetaData();

const metricsBatchRequestProcessor = batchRequestFactory.createRequestProcessor(
  items => {
    const urlConfig = {
      url: getBatchMetricsUrl(),
      retryable: true,
      withCredentials: true
    };
    const measures = items.map(({ data: { taskId, ...otherKeys } }) => ({ ...otherKeys }));
    return httpService.post(urlConfig, measures).then(() => {
      const results: MetricsResult = {};
      items.forEach(({ key }) => {
        results[key] = true;
      });
      return results;
    });
  },
  ({ taskId }: Measure) => taskId?.toString() || '',
  {
    getFailureCooldown: batchRequestFactory.createExponentialBackoffCooldown(1000, 3000),
    maxRetryAttempts: 5,
    batchSize: performanceMetricsBatchSize || DefaultBatchSize,
    processBatchWaitTime: performanceMetricsBatchWaitTime || DefaultProcessBatchWaitTime
  }
);

export default {
  logMeasurement: (metricName: string, jsonData: JsonData) => {
    const taskId = idCounter;
    idCounter += 1;
    const measure: Measure = {
      metricName,
      jsonData: JSON.stringify(jsonData)
    };
    return metricsBatchRequestProcessor.queueItem({ taskId, ...measure });
  }
};
