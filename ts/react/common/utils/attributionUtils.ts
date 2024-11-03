import { uuidService } from 'core-utilities';

const AttributionIdsKey = 'robloxAttributionIds';

export enum AttributionType {
  GameDetailReferral = 'gameDetailReferral'
}

export const getAttributionId = (type: AttributionType): string => {
  // Store attribution ids on the window object to ensure ids persist across modules
  const windowRecord = (window as unknown) as Record<string, unknown>;
  let attributionIds = windowRecord[AttributionIdsKey] as Record<string, string>;
  if (!attributionIds) {
    attributionIds = {};
    windowRecord[AttributionIdsKey] = attributionIds;
  }

  let attributionId = attributionIds[type];
  if (!attributionId) {
    attributionId = uuidService.generateRandomUuid();
    attributionIds[type] = attributionId;
  }

  return attributionId;
};

export default { getAttributionId };
