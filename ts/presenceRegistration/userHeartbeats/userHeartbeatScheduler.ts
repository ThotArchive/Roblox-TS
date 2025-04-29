import sendPulse from './services/pulseService';

class UserHeartbeatScheduler {
  isActive = false;

  intervalTimeMs = 0;

  timeoutActive = false;

  constructor(intervalTimeMs: number) {
    this.intervalTimeMs = intervalTimeMs;
  }

  start(): Promise<void> {
    return this.sendPulseAndSetTimeout();
  }

  async onActiveEvent(): Promise<void> {
    if (!this.timeoutActive) {
      await this.sendPulseAndSetTimeout();
    } else {
      this.isActive = true;
    }
  }

  onInactiveEvent(): void {
    this.isActive = false;
  }

  async sendPulseAndSetTimeout(): Promise<void> {
    this.timeoutActive = true;
    await sendPulse();
    setTimeout(() => this.onTimeout(), this.intervalTimeMs);
  }

  async onTimeout(): Promise<void> {
    if (this.isActive) {
      await this.sendPulseAndSetTimeout();
      this.isActive = false;
    } else {
      this.timeoutActive = false;
    }
  }
}

export default UserHeartbeatScheduler;
