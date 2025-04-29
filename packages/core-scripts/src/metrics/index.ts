import { post } from "../http";
import BatchRequestFactory from "../util/batch-request/batchRequestFactory";
import {
  batchMetricsUrl,
  Measure,
  MetricsResult,
  defaultBatchSize,
  defaultProcessBatchWaitTime,
} from "./constants";

const isLen3 = <T>(arr: T[]): arr is [T, T, T] => arr.length === 3;

const getTimeSpanFromString = (timeSpan: string) => {
  const timeSpanFormat = timeSpan.split(":");
  if (isLen3(timeSpanFormat)) {
    const [hr, min, sec] = timeSpanFormat;
    return 1000 * (parseInt(hr, 10) * 60 * 60 + parseInt(min, 10) * 60 + parseInt(sec, 10));
  }
  return undefined;
};

const metaData = (): {
  performanceMetricsBatchWaitTime?: number;
  performanceMetricsBatchSize?: number;
} => {
  const metaElement = document.getElementsByName("performance")[0];
  if (metaElement) {
    const waitTime = metaElement.getAttribute("data-ui-performance-metrics-batch-wait-time");
    const batchSize = metaElement.getAttribute("data-ui-performance-metrics-batch-size");
    return {
      performanceMetricsBatchWaitTime:
        waitTime != null ? getTimeSpanFromString(waitTime) : undefined,
      performanceMetricsBatchSize: batchSize != null ? parseInt(batchSize, 10) : undefined,
    };
  }
  return {};
};

const { performanceMetricsBatchWaitTime, performanceMetricsBatchSize } = metaData();

const batchRequestFactory = new BatchRequestFactory<Measure, MetricsResult>();
let idCounter = 0;

const metricsBatchRequestProcessor = batchRequestFactory.createRequestProcessor(
  items => {
    const urlConfig = {
      url: batchMetricsUrl(),
      retryable: true,
      withCredentials: true,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const measures = items.map(({ data: { taskId, ...otherKeys } }) => ({ ...otherKeys }));
    return post(urlConfig, measures).then(() => {
      const results: MetricsResult = {};
      for (const { key } of items) {
        results[key] = true;
      }
      return results;
    });
  },
  ({ taskId }) => taskId.toString(),
  {
    batchSize: performanceMetricsBatchSize ?? defaultBatchSize,
    processBatchWaitTime: performanceMetricsBatchWaitTime ?? defaultProcessBatchWaitTime,
  },
);

export const logMeasurement = (measure: Omit<Measure, "taskId">): Promise<MetricsResult> => {
  const taskId = idCounter;
  idCounter += 1;
  return metricsBatchRequestProcessor.queueItem({ ...measure, taskId });
};
