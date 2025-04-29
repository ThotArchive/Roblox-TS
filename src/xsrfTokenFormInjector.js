import $ from "jquery";
import * as xsrfToken from "@rbx/core-scripts/auth/xsrfToken";

const inputName = "CsrfToken";

const maxTokenAgeInSeconds = 60 * 5;

const fetchLatestXsrfToken = callback => {
  $.ajax({
    method: "GET",
    url: "/XsrfToken",
    success: (output, status, xhr) => {
      const token = xhr.getResponseHeader("X-CSRF-TOKEN");
      callback(token);
    },
    error: () => {
      callback(null);
    },
  });
};

const attachToken = form => {
  $("<input />")
    .attr("type", "hidden")
    .attr("name", inputName)
    .attr("value", xsrfToken.getToken())
    .appendTo(form);
};

const isUnobtrusiveAjaxForm = form => form.dataset.ajax === "true";

const formRequiresXsrf = form =>
  xsrfToken.requiresXsrf(form.getAttribute("method"), form.getAttribute("action")) &&
  xsrfToken.getToken() &&
  $(form).children(`input[name='${inputName}']`).length === 0;

const isTokenStale = () => {
  const tokenTimestamp = xsrfToken.getTokenTimestamp();
  if (tokenTimestamp === null) {
    return true;
  }

  const differenceInMs = new Date() - tokenTimestamp;
  const differenceInSeconds = differenceInMs / 1000;
  return differenceInSeconds > maxTokenAgeInSeconds;
};

function overrideSubmit(event) {
  const form = event ? event.target : this;

  if (isUnobtrusiveAjaxForm(form)) {
    // Unobtrusive ajax forms don't use regular form submissions, so we don't need to inject the token
    // We also don't need to re-submit the form either.
    return;
  }

  if (!formRequiresXsrf(form)) {
    // eslint-disable-next-line no-underscore-dangle
    form._submit();
    return;
  }

  if (!isTokenStale()) {
    attachToken(form);
    // eslint-disable-next-line no-underscore-dangle
    form._submit();
  } else {
    // Pre-fetch XSRF token before re-submitting the form when it's stale
    // example: if someone has the page open for 30+ minutes
    fetchLatestXsrfToken(newToken => {
      if (newToken) {
        xsrfToken.setToken(newToken);
      }
      attachToken(form);
      // eslint-disable-next-line no-underscore-dangle
      form._submit();
    });

    // Prevent the form from submitting until we get the new token
    // eslint-disable-next-line consistent-return
    return false;
  }
}

const initialize = () => {
  window.addEventListener("submit", overrideSubmit, true);
  // TODO: is this necessary
  // eslint-disable-next-line no-underscore-dangle
  HTMLFormElement.prototype._submit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = overrideSubmit;
};

export default {
  initialize,
};
