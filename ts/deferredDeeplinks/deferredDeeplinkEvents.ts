import { EventStream } from 'Roblox';
import {
  deferredDeeplinkDownloadInstallerContext,
  deferredDeeplinkCreateTokenAction,
  deferredDeeplinkGroupName,
  deferredDeeplinkCreateTokenEventName
} from './deferredDeeplinkConstants';

// From https://github.rbx.com/Roblox/proto-schemas/blob/2b2b298eb1fd8dc380dd68058b352eb2ef84fdd1/production/eventstream/bizops/deferred_deep_links_token_action.proto
type TDeferredDeepLinksTokenActionEvent = {
  // eslint-disable-next-line camelcase
  link_url: string;
  group: string;
  action: string;
  // eslint-disable-next-line camelcase
  status_code: number;
  token?: string;
};

/** safely sends an event on attempts to create a deeplink token */
function sendDeeplinkTokenCreateAttempt(
  token: string | null,
  linkUrl: string,
  statusCode: number
): void {
  const event: TDeferredDeepLinksTokenActionEvent = {
    link_url: linkUrl,
    group: deferredDeeplinkGroupName,
    action: deferredDeeplinkCreateTokenAction,
    status_code: statusCode,
    token: token ?? ''
  };

  try {
    EventStream.SendEventWithTarget(
      deferredDeeplinkCreateTokenEventName,
      deferredDeeplinkDownloadInstallerContext,
      event,
      EventStream.TargetTypes.WWW
    );
  } catch {
    // ignore
  }
}

export default sendDeeplinkTokenCreateAttempt;
