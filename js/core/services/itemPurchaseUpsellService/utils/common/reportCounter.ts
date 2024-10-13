import { fireEvent } from 'roblox-event-tracker';
import {
  ASSET_TYPE_ENUM,
  UPSELL_COUNTER_BUNDLE_PREFIX,
  UPSELL_COUNTER_CATALOG_PREFIX,
  UPSELL_COUNTER_GAME_PASS_PREFIX,
  UPSELL_COUNTER_NAMES
} from '../../constants/upsellConstants';

function reportCatalogCounter(eventName: string) {
  fireEvent(UPSELL_COUNTER_CATALOG_PREFIX + eventName);
}
function reportBundleCounter(eventName: string) {
  fireEvent(UPSELL_COUNTER_BUNDLE_PREFIX + eventName);
}
function reportGamePassCounter(eventName: string) {
  fireEvent(UPSELL_COUNTER_GAME_PASS_PREFIX + eventName);
}

export default function reportCounter(eventName: string, assetType?: string) {
  if (assetType === ASSET_TYPE_ENUM.BUNDLE || assetType === ASSET_TYPE_ENUM.BUNDLE_ALIAS) {
    reportBundleCounter(eventName);
  } else if (assetType === ASSET_TYPE_ENUM.GAME_PASS) {
    reportGamePassCounter(eventName);
  } else if (!assetType) {
    reportCatalogCounter(UPSELL_COUNTER_NAMES.UnknownErrorNoAsset);
  } else {
    reportCatalogCounter(eventName);
  }
}
