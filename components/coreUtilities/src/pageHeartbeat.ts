import environmentUrls from "@rbx/environment-urls";
import { get } from "@rbx/core-scripts/http";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  activeEvents,
  defaultRolloutPermille,
  defaultActivityTimeoutMs,
  defaultHeartbeatPulseIntervalMs,
  defaultWorkerVersion,
  guacUrlSuffix,
} from "@rbx/page-heartbeat-worker";

const { CurrentUser } = window.Roblox;

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
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.Worker) {
      this.worker = this.createWorker();
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.worker) {
        this.worker.onmessage = () => {
          this.onInterval();
        };
      }
    } else {
      this.worker = null;
    }
  }

  createWorker() {
    const WORKER_COMPONENT = "PageHeartbeatWorker";
    const URL_NOT_FOUND = "URL_NOT_FOUND";
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const websiteUrl = environmentUrls.websiteUrl ?? URL_NOT_FOUND;
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
      setInterval(() => {
        this.onInterval();
      }, this.heartbeatPulseIntervalMs);
    }

    this.isRunning = true;
  }

  onInterval() {
    const currentTime = new Date();
    const thresholdTime = new Date(currentTime.getTime() - this.activityTimeoutMs);
    if (this.lastActiveTime >= thresholdTime) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      sendEventWithTarget(
        "pageHeartbeat_v2",
        `heartbeat${this.heartbeatCount}`,
        {},
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        targetTypes.WWW,
      );
      this.incrementCount();
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

const loadGuacConfig = async (): Promise<GuacConfig> => {
  const { apiGatewayUrl } = environmentUrls;
  try {
    const config = await get<GuacResponse>({
      url: `${apiGatewayUrl}${guacUrlSuffix}`,
    });

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/consistent-type-assertions
    const data = config?.data;

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!data) {
      return {
        isEnabled: true,
        rolloutPermille: defaultRolloutPermille,
        activityTimeoutMs: defaultActivityTimeoutMs,
        heartbeatPulseIntervalMs: defaultHeartbeatPulseIntervalMs,
        workerVersion: defaultWorkerVersion,
      };
    }

    return {
      isEnabled: Boolean(data.isEnabled),
      rolloutPermille: data.rolloutPermille ?? defaultRolloutPermille,
      activityTimeoutMs: data.activityTimeoutMs ?? defaultActivityTimeoutMs,
      heartbeatPulseIntervalMs: data.heartbeatPulseIntervalMs ?? defaultHeartbeatPulseIntervalMs,
      workerVersion: data.workerVersion ?? defaultWorkerVersion,
    };
  } catch {
    return {
      isEnabled: true,
      rolloutPermille: defaultRolloutPermille,
      activityTimeoutMs: defaultActivityTimeoutMs,
      heartbeatPulseIntervalMs: defaultHeartbeatPulseIntervalMs,
      workerVersion: defaultWorkerVersion,
    };
  }
};

export default async (): Promise<void> => {
  const config = await loadGuacConfig();

  if (
    !(
      config.isEnabled &&
      CurrentUser?.userId &&
      parseInt(CurrentUser.userId, 10) % 1000 < config.rolloutPermille
    )
  ) {
    return;
  }

  const scheduler = new PageHeartbeatScheduler(
    config.heartbeatPulseIntervalMs,
    config.activityTimeoutMs,
    config.workerVersion,
  );

  activeEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      scheduler.onActiveEvent();
    });
  });

  scheduler.start();
};
