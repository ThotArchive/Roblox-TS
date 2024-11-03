import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import { getUpsellCardTypeUrlConfig, getVoicePolicyConfig } from '../constants/urlConstants';
import { UpsellCardEventContext } from '../constants/upsellCardConstants';

export const getHomePageUpsellCardVariation = () => {
  const urlConfig = getUpsellCardTypeUrlConfig();
  return httpService.get(urlConfig).then(({ data }) => {
    return data;
  });
};

export const getVoicePolicy = async () => {
  const urlConfig = getVoicePolicyConfig();
  const { data } = await httpService.get(urlConfig);
  return data;
};

export const sendEvent = (event, origin, cardType, section, btn = undefined) => {
  eventStreamService.sendEventWithTarget(event.type, UpsellCardEventContext[cardType], {
    ...event.params,
    origin,
    section,
    btn
  });
};
