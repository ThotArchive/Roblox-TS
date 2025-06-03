import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  init as sentryInit,
  setUser as sentrySetUser,
  setTag as setSentryTag,
  browserTracingIntegration,
} from "@sentry/browser";

const metaTag = document.querySelector<HTMLMetaElement>('meta[name="sentry-meta"]');
const { dsn, envName, sampleRate } = metaTag?.dataset ?? {};

sentryInit({
  dsn:
    dsn ?? "https://24df60727c94bd0aa14ab1269d104a21@o293668.ingest.us.sentry.io/4509158985826304",
  integrations: [browserTracingIntegration()],
  environment: envName ?? "staging",
  tracesSampleRate: sampleRate == null ? 0.5 : parseFloat(sampleRate),
  sampleRate: sampleRate == null ? 0.5 : parseFloat(sampleRate),
  replaysOnErrorSampleRate: sampleRate == null ? 0.5 : parseFloat(sampleRate),
});

document.addEventListener("DOMContentLoaded", () => {
  // Set more context for Sentry exceptions
  sentrySetUser({
    id: authenticatedUser.id?.toString() ?? "1",
    username: authenticatedUser.name ?? "unknown",
  });

  // Set initial internal-page-name tag from meta tag
  const pageMetaTag = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
  if (pageMetaTag?.dataset.internalPageName) {
    setSentryTag("internal-page-name", pageMetaTag.dataset.internalPageName);
  }

  // Watch for changes to the page-meta tag and update the Sentry tag
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-internal-page-name" &&
        mutation.target instanceof HTMLMetaElement
      ) {
        const newValue = mutation.target.dataset.internalPageName;
        if (newValue) {
          setSentryTag("internal-page-name", newValue);
        }
      }
    });
  });

  if (pageMetaTag) {
    observer.observe(pageMetaTag, {
      attributes: true,
      attributeFilter: ["data-internal-page-name"],
    });
  }
});
