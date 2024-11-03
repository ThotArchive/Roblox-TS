import { Tracker, Configuration, TrackerRequest, TrackerResponse } from '@rbx/event-stream';
import { EnvironmentUrls } from 'Roblox';

const robloxSiteDomain = EnvironmentUrls.domain;

export interface AccessManagementUpsellEvent {
  name: string;
  type: string;
  context: string;
  params: Record<string, string>;
}

const defaultConfiguration = new Configuration({
  baseUrl: `https://ecsv2.${robloxSiteDomain}/AccessManagementUpsell`
});
const tracker = new Tracker(defaultConfiguration);

export interface TrackerClient {
  sendEvent(event: AccessManagementUpsellEvent): HTMLImageElement;
}

const trackerClient: TrackerClient = {
  sendEvent(event: AccessManagementUpsellEvent) {
    const request: TrackerRequest = {
      target: event.name,
      localTime: new Date(),
      eventType: event.type,
      context: event.context,
      additionalProperties: { ...event.params }
    };
    return tracker.sendEventViaImg(request);
  }
};

export default trackerClient;
