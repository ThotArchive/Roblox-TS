/**
 * Interface based on `Web/RobloxWebSite/js/EventTracker.js` in `web-platform`.
 */
export interface RobloxEventTracker {
  start: (...statSequenceNames: string[]) => void;
  endSuccess: (...statSequenceNames: string[]) => void;
  endCancel: (...statSequenceNames: string[]) => void;
  endFailure: (...statSequenceNames: string[]) => void;
  fireEvent: (...metricNames: string[]) => void;
}

// Injected by `web-platform` into the global namespace. We type this as
// potentially undefined because ad blockers have been known to remove the
// tracking code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export default (window as any).EventTracker as RobloxEventTracker | undefined;
