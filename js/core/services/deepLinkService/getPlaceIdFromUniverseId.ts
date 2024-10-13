import { EnvironmentUrls } from 'Roblox';
import { httpService } from '../../http/http';

const GameInfoUrlConfig = {
  url: `${EnvironmentUrls.gamesApi}/v1/games`,
  withCredentials: true
};

type GameInfoResponse = {
  data?: {
    data?: [
      {
        rootPlaceId?: number;
      }
    ];
  };
};

const getPlaceIdFromUniverseId = (gameId: string): Promise<number> => {
  return httpService
    .get(GameInfoUrlConfig, {
      universeIds: [gameId]
    })
    .then((response: GameInfoResponse) => {
      return response?.data?.data?.[0]?.rootPlaceId;
    });
};

export default getPlaceIdFromUniverseId;
