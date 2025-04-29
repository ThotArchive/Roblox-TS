import { Span } from "opentracing";

const setMessageLog = (span: Span, message: string) => {
  span.log({
    message,
  });
};

const setXHRRequestLogs = (span: Span): void => {
  setMessageLog(span, "request_sent");
};

const setXHRResponseSuccessLogs = (span: Span): void => {
  setMessageLog(span, "request_ok");
};

const setXHRResponseErrorLogs = (span: Span): void => {
  span.log({
    message: "request_failed",
  });
};

export default {
  setXHRRequestLogs,
  setXHRResponseSuccessLogs,
  setXHRResponseErrorLogs,
};
