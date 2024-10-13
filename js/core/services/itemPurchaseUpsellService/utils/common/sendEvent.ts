import { EventStream } from 'Roblox';
import { ITEM_UPSELL_EVENTS } from '../../constants/upsellConstants';

export default function sendEvent(context: string, properties: { [key: string]: unknown }) {
  try {
    EventStream.SendEventWithTarget(
      ITEM_UPSELL_EVENTS.EVENT_NAME,
      context,
      properties,
      EventStream.TargetTypes.WWW
    );
  } catch (e) {
    // do nothing
  }
}
