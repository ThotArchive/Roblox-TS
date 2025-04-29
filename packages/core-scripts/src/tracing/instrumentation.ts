import { isTestSite } from "@rbx/core-scripts/meta/environment";
import opentracing, { Span, SpanOptions } from "opentracing";
import lightstep, { Tracer } from "lightstep-tracer";
import configs from "./constants/configs";

const envVersion = isTestSite() ? configs.environments.dev : configs.environments.prod;

const initTracer = (componentName: string, isPageLoadInstrumented: boolean): Tracer | null => {
  if (!configs.metaData.accessToken) {
    return null;
  }
  const tracer = new Tracer({
    access_token: configs.metaData.accessToken,
    component_name: componentName,
    tags: {
      "service.version": envVersion,
    },
    instrument_page_load: isPageLoadInstrumented,
    // @ts-expect-error Types do not include `propagators`, but it is supported.
    propagators: {
      // @ts-expect-error Types do not include `B3Propagator`, but it is exported.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      [opentracing.FORMAT_HTTP_HEADERS]: new lightstep.B3Propagator(),
    },
  });

  opentracing.initGlobalTracer(tracer);

  return tracer;
};

const createAndGetSpan = (name: string, fields: SpanOptions): Span =>
  opentracing.globalTracer().startSpan(name, fields);

const finalizeSpan = (span?: Span | null): void => {
  if (span) {
    span.finish();
  }
};

export default {
  initTracer,
  createAndGetSpan,
  finalizeSpan,
};
