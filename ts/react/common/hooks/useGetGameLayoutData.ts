import { useMemo } from 'react';
import { TGameData, TLayoutMetadata } from '../types/bedev1Types';

const useGetGameLayoutData = (gameData: TGameData, topicId?: string) => {
  const gameLayoutData = useMemo((): TLayoutMetadata | undefined => {
    if (gameData.layoutDataBySort && topicId && gameData.layoutDataBySort[topicId]) {
      return gameData.layoutDataBySort[topicId];
    }

    return gameData.defaultLayoutData;
  }, [gameData.layoutDataBySort, gameData.defaultLayoutData, topicId]);

  return gameLayoutData;
};

export default useGetGameLayoutData;
