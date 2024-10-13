export default class EventTimer {
  constructor() {
    this.timeStore = {};
  }

  start(eventName) {
    this.timeStore[eventName] = Date.now();
  }

  end(eventName) {
    const eventStartTime = this.timeStore[eventName];
    if (eventStartTime) {
      delete this.timeStore[eventName];
      return new Date().valueOf() - eventStartTime;
    }
    return null;
  }
}
