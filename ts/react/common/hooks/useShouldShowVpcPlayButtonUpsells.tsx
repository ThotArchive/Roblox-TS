import { useState, useEffect } from 'react';
import bedev2Services from '../services/bedev2Services';

const useShouldShowVpcPlayButtonUpsells = (): {
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  isFetchingPolicy: boolean;
} => {
  const [shouldShowVpcPlayButtonUpsells, setShouldShowVpcPlayButtonUpsells] = useState<
    boolean | undefined
  >(undefined);
  const [isFetchingPolicy, setIsFetchingPolicy] = useState<boolean>(false);

  useEffect(() => {
    setIsFetchingPolicy(true);
    bedev2Services
      .getGuacAppPolicyBehaviorData()
      .then(data => {
        setShouldShowVpcPlayButtonUpsells(data.shouldShowVpcPlayButtonUpsells);
      })
      .catch(() => {
        setShouldShowVpcPlayButtonUpsells(false);
      })
      .finally(() => {
        setIsFetchingPolicy(false);
      });
  }, []);

  return { shouldShowVpcPlayButtonUpsells, isFetchingPolicy };
};

export default useShouldShowVpcPlayButtonUpsells;
