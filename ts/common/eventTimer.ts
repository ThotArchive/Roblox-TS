export default class EventTimer {
  private timeStore: Record<string, number>;

  constructor() {
    this.timeStore = {};
  }

  start(eventName: string): void {
    this.timeStore[eventName] = Date.now();
  }

  end(eventName: string): number | null {
    const eventStartTime = this.timeStore[eventName];
    if (eventStartTime) {
      delete this.timeStore[eventName];
      return Date.now() - eventStartTime;
    }
    return null;
  }
}
