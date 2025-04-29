// bootstrap
import { Tracer } from "opentracing";
import configs from "./constants/configs";
import instrumentation from "./instrumentation";

const { sampleRate, serviceName, tracerEnabled, isInstrumentPagePerformanceEnabled } =
  configs.metaData;

const randomNumber = Math.floor(Math.random() * 100 + 1);
const isTracerEnabled = tracerEnabled && randomNumber <= sampleRate;
const rootTracer = (): Tracer | null =>
  isTracerEnabled
    ? instrumentation.initTracer(serviceName, isInstrumentPagePerformanceEnabled)
    : null;

export default {
  isTracerEnabled,
  rootTracer,
};
