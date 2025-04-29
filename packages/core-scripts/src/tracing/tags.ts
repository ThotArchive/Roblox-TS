import { Span } from "opentracing";
import configs from "./constants/configs";

const setErrorTag = (span: Span): void => {
  span.setTag("error", "true");
};

/** Pre-defined certain tags required for XMLHttpRequest  */
const setXHRDefaultTags = (span: Span, tagFields: Record<string, string>): void => {
  const { component, method, url } = tagFields;

  span.setTag("span.kind", "client");
  span.setTag("component", component);
  span.setTag("http.method", method);
  span.setTag("http.url", url);
  span.setTag("page.name", configs.pageName);
  span.setTag("page.url", window.location.href);
  span.setTag("user.agent", navigator.userAgent);
};

const setXHRRequestTags = (span: Span, tagFields: Record<string, string>): void => {
  setXHRDefaultTags(span, tagFields);
};

const setXHRResponseTags = (span: Span, tagFields: { status: number }): void => {
  span.setTag("http.status_code", tagFields.status);
};

const setXHRResponseErrorTags = (span: Span, tagFields: { status: number }): void => {
  setErrorTag(span);
  span.setTag("http.status_code", tagFields.status);
};

const setPlaceIdTag = (span: Span, placeId: string): void => {
  span.setTag("guid:place_id", placeId);
};

const setDefaultTags = (span: Span): void => {
  span.setTag("span.kind", "client");
};

export default {
  setErrorTag,
  setXHRRequestTags,
  setXHRResponseTags,
  setXHRResponseErrorTags,
  setPlaceIdTag,
  setDefaultTags,
};
