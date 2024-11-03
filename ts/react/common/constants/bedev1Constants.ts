import { EnvironmentUrls } from 'Roblox';
import { TPageType } from '../types/bedev1Types';

const { gamesApi } = EnvironmentUrls;
type TUrl = { url: string; withCredentials: boolean };

const url = {
  getOmniRecommendations: (pageType: TPageType, sessionId?: string): TUrl => ({
    url: `${gamesApi}/v1/games/omni-recommendations?model.pageType=${pageType}${
      sessionId !== undefined ? `&model.sessionId=${sessionId}` : ''
    }`,
    withCredentials: true
  }),
  getOmniRecommendationsMetadata: {
    url: `${gamesApi}/v1/games/omni-recommendations-metadata`,
    withCredentials: true
  },
  getGameList: { url: `${gamesApi}/v1/games/list`, withCredentials: true },
  getGamePasses: (universeId: string, max: number): TUrl => ({
    url: `${gamesApi}/v1/games/${universeId}/game-passes?limit=${max}`,
    withCredentials: true
  }),
  getGameRecommendations: (universeId: string): TUrl => ({
    url: `${gamesApi}/v1/games/recommendations/game/${universeId}`,
    withCredentials: true
  }),
  getGameSorts: {
    url: `${gamesApi}/v1/games/sorts`,
    withCredentials: true
  },
  getUniverseVoiceStatus: (universeId: string): TUrl => ({
    withCredentials: true,
    url: `${EnvironmentUrls.voiceApi}/v1/settings/universe/${universeId}`
  }),
  getVoiceOptInStatus: {
    withCredentials: true,
    url: `${EnvironmentUrls.voiceApi}/v1/settings/user-opt-in`
  }
};

const defaultCacheCriteria = {
  refreshCache: false,
  expirationWindowMS: 30000,
  useCache: true
};

export default {
  url,
  defaultCacheCriteria
};
