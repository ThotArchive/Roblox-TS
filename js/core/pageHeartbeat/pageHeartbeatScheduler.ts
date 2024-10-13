import Roblox, { EnvironmentUrls } from 'Roblox';

import { httpService } from '../http/http';

import {
  activeEvents,
  defaultRolloutPermille,
  defaultActivityTimeoutMs,
  defaultHeartbeatPulseIntervalMs,
  defaultWorkerVersion,
  guacUrlSuffix
} from './constants/constants';

class PageHeartbeatScheduler {
  lastActiveTime;

  heartbeatCount;

  heartbeatPulseIntervalMs;

  activityTimeoutMs;

  workerVersion;

  worker;

  isRunning = false;

  constructor(heartbeatPulseIntervalMs: number, activityTimeoutMs: number, workerVersion: number) {
    this.lastActiveTime = new Date();
    this.heartbeatCount = 1;
    this.heartbeatPulseIntervalMs = heartbeatPulseIntervalMs;
    this.activityTimeoutMs = activityTimeoutMs;
    this.workerVersion = workerVersion;
    if (window.Worker) {
      this.worker = this.createWorker();
      if (this.worker) {
        this.worker.onmessage = ev => this.onInterval(this, ev);
      }
    } else {
      this.worker = null;
    }
  }

  createWorker() {
    const WORKER_COMPONENT = 'PageHeartbeatWorker';
    const URL_NOT_FOUND = 'URL_NOT_FOUND';
    const websiteUrl = EnvironmentUrls.websiteUrl ?? URL_NOT_FOUND;
    const workerUrl = `${websiteUrl}/worker-resources/script/?component=${WORKER_COMPONENT}&?v=${this.workerVersion}`;

    const worker = new Worker(workerUrl);
    return worker;
  }

  onActiveEvent() {
    this.lastActiveTime = new Date();
  }

  start() {
    if (this.isRunning) {
      return;
    }

    if (this.worker) {
      this.worker.postMessage(this.heartbeatPulseIntervalMs);
    } else {
      setInterval(() => this.onInterval(this, {}), this.heartbeatPulseIntervalMs);
    }

    this.isRunning = true;
  }

  onInterval(self: PageHeartbeatScheduler, ev: unknown) {
    const currentTime = new Date();
    const thresholdTime = new Date(currentTime.getTime() - self.activityTimeoutMs);
    if (this.lastActiveTime >= thresholdTime) {
      Roblox.EventStream.SendEventWithTarget(
        'pageHeartbeat_v2',
        `heartbeat${self.heartbeatCount}`,
        {},
        Roblox.EventStream.TargetTypes.WWW
      );
      self.incrementCount();
    }
  }

  incrementCount() {
    this.heartbeatCount += 1;
  }
}

type GuacResponse = {
  isEnabled?: boolean;
  rolloutPermille?: number;
  activityTimeoutMs?: number;
  heartbeatPulseIntervalMs?: number;
  workerVersion?: number;
};

type GuacConfig = {
  isEnabled: boolean;
  rolloutPermille: number;
  activityTimeoutMs: number;
  heartbeatPulseIntervalMs: number;
  workerVersion: number;
};

async function loadGuacConfig(): Promise<GuacConfig> {
  const { apiGatewayUrl } = EnvironmentUrls;
  try {
    const config = await httpService.get({
      url: `${apiGatewayUrl}${guacUrlSuffix}`
    });

    const data = config?.data as GuacResponse;

    if (!data) {
      return {
        isEnabled: true,
        rolloutPermille: defaultRolloutPermille,
        activityTimeoutMs: defaultActivityTimeoutMs,
        heartbeatPulseIntervalMs: defaultHeartbeatPulseIntervalMs,
        workerVersion: defaultWorkerVersion
      };
    }

    return {
      isEnabled: Boolean(data.isEnabled),
      rolloutPermille: data.rolloutPermille ?? defaultRolloutPermille,
      activityTimeoutMs: data.activityTimeoutMs ?? defaultActivityTimeoutMs,
      heartbeatPulseIntervalMs: data.heartbeatPulseIntervalMs ?? defaultHeartbeatPulseIntervalMs,
      workerVersion: data.workerVersion ?? defaultWorkerVersion
    };
  } catch (e) {
    return {
      isEnabled: true,
      rolloutPermille: defaultRolloutPermille,
      activityTimeoutMs: defaultActivityTimeoutMs,
      heartbeatPulseIntervalMs: defaultHeartbeatPulseIntervalMs,
      workerVersion: defaultWorkerVersion
    };
  }
}

export default async function pageHeartbeatInit(): Promise<void> {
  const config = await loadGuacConfig();

  if (
    !(
      config.isEnabled &&
      Roblox.CurrentUser?.userId &&
      parseInt(Roblox.CurrentUser.userId, 10) % 1000 < config.rolloutPermille
    )
  ) {
    return;
  }

  const scheduler = new PageHeartbeatScheduler(
    config.heartbeatPulseIntervalMs,
    config.activityTimeoutMs,
    config.workerVersion
  );

  activeEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      scheduler.onActiveEvent();
    });
  });

  scheduler.start();
}
