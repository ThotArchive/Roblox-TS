import { useState, useEffect, useMemo } from 'react';
import bedev2Services from '../services/bedev2Services';

type TAppPolicyData = {
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  shouldShowLikeFavoriteCounts: boolean | undefined;
};

type TUseGetAppPolicyData = TAppPolicyData & {
  isFetchingPolicy: boolean;
};

const useGetAppPolicyData = (): TUseGetAppPolicyData => {
  const [appPolicyData, setAppPolicyData] = useState<TAppPolicyData>({
    shouldShowVpcPlayButtonUpsells: undefined,
    shouldShowLikeFavoriteCounts: undefined
  });

  const [isFetchingPolicy, setIsFetchingPolicy] = useState<boolean>(false);

  useEffect(() => {
    setIsFetchingPolicy(true);
    bedev2Services
      .getGuacAppPolicyBehaviorData()
      .then(data => {
        setAppPolicyData({
          shouldShowVpcPlayButtonUpsells: data.shouldShowVpcPlayButtonUpsells,
          shouldShowLikeFavoriteCounts: data.EnableAggregateLikesFavoritesCount
        });
      })
      .catch(() => {
        setAppPolicyData({
          shouldShowVpcPlayButtonUpsells: false,
          shouldShowLikeFavoriteCounts: false
        });
      })
      .finally(() => {
        setIsFetchingPolicy(false);
      });
  }, []);

  return useMemo(() => {
    const { shouldShowVpcPlayButtonUpsells, shouldShowLikeFavoriteCounts } = appPolicyData;

    return {
      shouldShowVpcPlayButtonUpsells,
      shouldShowLikeFavoriteCounts,
      isFetchingPolicy
    };
  }, [
    appPolicyData.shouldShowVpcPlayButtonUpsells,
    appPolicyData.shouldShowLikeFavoriteCounts,
    isFetchingPolicy
  ]);
};

export default useGetAppPolicyData;
