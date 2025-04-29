import environmentUrls from "@rbx/environment-urls";

export const batchMetricsUrl = (): string =>
  `${environmentUrls.metricsApi}/v1/performance/measurements`;

export const defaultBatchSize = 100;

export const defaultProcessBatchWaitTime = 10000;

export type Measure = {
  taskId: number;
  featureName: string;
  measureName: string;
  value?: number;
  metricsType: "Counter" | "Sequence";
  excludeCountry?: boolean;
};

export type MetricsResult = Record<string, boolean>;
