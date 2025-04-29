import environmentUrls from "@rbx/environment-urls";
import { get } from "../http";

const GameInfoUrlConfig = {
  url: `${environmentUrls.gamesApi}/v1/games`,
  withCredentials: true,
};

type GameInfoResponse = {
  data?: [
    {
      rootPlaceId?: number;
    },
  ];
};

const getPlaceIdFromUniverseId = (gameId: string): Promise<number> =>
  get<GameInfoResponse>(GameInfoUrlConfig, {
    universeIds: [gameId],
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  }).then(response => response.data.data?.[0]?.rootPlaceId!);

export default getPlaceIdFromUniverseId;
