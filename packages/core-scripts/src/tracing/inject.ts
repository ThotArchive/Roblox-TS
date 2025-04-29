import opentracing, { Span } from "opentracing";

const httpRequestCarrier = (span: Span): Record<string, string> => {
  const carrier = {};
  opentracing.globalTracer().inject(span, opentracing.FORMAT_HTTP_HEADERS, carrier);
  return carrier;
};

const textMapCarrier = (span: Span): Record<string, string> => {
  const carrier = {};
  opentracing.globalTracer().inject(span, opentracing.FORMAT_TEXT_MAP, carrier);
  return carrier;
};

export default {
  httpRequestCarrier,
  textMapCarrier,
};
