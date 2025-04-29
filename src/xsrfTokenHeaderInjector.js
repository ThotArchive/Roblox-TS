import $ from "jquery";
import * as xsrfToken from "@rbx/core-scripts/auth/xsrfToken";

const csrfTokenHeader = "X-CSRF-TOKEN";
const csrfInvalidResponseCode = 403;

const handleAjaxSend = (event, jqxhr, settings) => {
  // Send CSRF if in our own domain and is a method that requires it
  const currentToken = xsrfToken.getToken();

  if (currentToken !== "" && xsrfToken.requiresXsrf(settings.type, settings.url)) {
    jqxhr.setRequestHeader(csrfTokenHeader, currentToken);
  }
};

const handleAjaxPrefilter = (options, originalOptions, jqxhr) => {
  if (options.dataType === "jsonp" || options.dataType === "script") {
    // these are most likely remote requests, don't set an error handler
    return;
  }

  if (!xsrfToken.requiresXsrf(options.type, options.url)) {
    return;
  }

  // save the original error callback for later
  if (originalOptions.error) {
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    originalOptions._error = originalOptions.error;
  }
  // overwrite *current request* error callback
  // eslint-disable-next-line no-param-reassign
  options.error = () => {};

  const dfd = $.Deferred();
  // if the request works, return normally
  jqxhr.done(dfd.resolve);

  // if the request fails, do something else, yet still resolve
  // eslint-disable-next-line func-names
  jqxhr.fail((...args) => {
    if (
      jqxhr.status === csrfInvalidResponseCode &&
      jqxhr.getResponseHeader(csrfTokenHeader) !== null
    ) {
      // this was a token failure, reissue the XHR with the returned token
      const newToken = jqxhr.getResponseHeader(csrfTokenHeader);

      if (newToken == null) {
        dfd.rejectWith(jqxhr, args);
        return;
      }
      xsrfToken.setToken(newToken);

      $.ajax(originalOptions).then(dfd.resolve, dfd.reject);
    } else {
      // add our _error callback to our promise object
      // eslint-disable-next-line no-underscore-dangle
      if (originalOptions._error) {
        // eslint-disable-next-line no-underscore-dangle
        dfd.fail(originalOptions._error);
      }
      dfd.rejectWith(jqxhr, args);
    }
  });

  // NOW override the jqXHR's promise functions with our deferred
  // eslint-disable-next-line consistent-return
  return dfd.promise(jqxhr);
};

const initialize = () => {
  $(document).ajaxSend(handleAjaxSend);
  $.ajaxPrefilter(handleAjaxPrefilter);
};

export default {
  initialize,
  handleAjaxSend,
  handleAjaxPrefilter,
};
