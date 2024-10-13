export enum SessionStorageKey {
  EventTracker = 'eventTracker'
}

function getRecord(key: string): Record<string, unknown> {
  try {
    const json = window.sessionStorage.getItem(key) || '{}';
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (parsed.constructor === Object) {
      return parsed;
    }
  } catch (e) {
    // Ignore parsing/syntax errors
  }

  return {};
}

export function getEventTracker(): Record<string, unknown> {
  return getRecord(SessionStorageKey.EventTracker);
}

export default {
  getEventTracker
};
