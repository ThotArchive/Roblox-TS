import { useState, useEffect } from 'react';
import { isAccountSwitcherAvailable } from '../utils/accountSwitcherUtils';

function useIsAccountSwitcherAvailableForBrowser(): [boolean, boolean] {
  const [isAccountSwitchingEnabledForBrowser, setIsAccountSwitchingEnabledForBrowser] = useState(
    false
  );
  const [isAccountSwitcherHookCompleted, setIsAccountSwitcherHookCompleted] = useState(false);

  useEffect(() => {
    isAccountSwitcherAvailable()
      .then((result: boolean) => {
        setIsAccountSwitchingEnabledForBrowser(result);
      })
      .finally(() => {
        setIsAccountSwitcherHookCompleted(true);
      });
  }, []);

  return [isAccountSwitchingEnabledForBrowser, isAccountSwitcherHookCompleted];
}

export default useIsAccountSwitcherAvailableForBrowser;
