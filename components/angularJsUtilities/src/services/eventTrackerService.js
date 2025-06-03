import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function eventTrackerService($log) {
  "ngInject";
  function isEventTrackerValid() {
    return EventTracker !== undefined && EventTracker !== null;
  }

  return {
    fireEvent: function (eventName) {
      if (isEventTrackerValid() && EventTracker.fireEvent) {
        EventTracker.fireEvent(eventName);
      }
    },
  };
}

angularJsUtilitiesModule.factory("eventTrackerService", eventTrackerService);

export default eventTrackerService;
