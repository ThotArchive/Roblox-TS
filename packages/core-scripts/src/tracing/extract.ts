import opentracing, { SpanContext } from "opentracing";

const httpRequestCarrier = (carrier: Record<string, string>): SpanContext | null =>
  opentracing.globalTracer().extract(opentracing.FORMAT_HTTP_HEADERS, carrier);

const textMapCarrier = (carrier: Record<string, string>): SpanContext | null =>
  opentracing.globalTracer().extract(opentracing.FORMAT_TEXT_MAP, carrier);

export default {
  httpRequestCarrier,
  textMapCarrier,
};
