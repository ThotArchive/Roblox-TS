import { useEffect, useState } from 'react';
import { AccountSwitcherService } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { TLoggedInUsers } from '../types/accountSwitcherTypes';

type UseLoggedInUsersReturnType = {
  loggedInUsers: TLoggedInUsers;
  isGettingLoggedInUsers: boolean;
};

function useLoggedInUsers(shouldFetchUserInfo = true): UseLoggedInUsersReturnType {
  const [loggedInUsers, setLoggedInUsers] = useState<TLoggedInUsers>({
    usersAvailableForSwitching: [],
    isAccountLimitReached: false
  });
  const [isGettingLoggedInUsers, setIsGettingLoggedInUsers] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await AccountSwitcherService?.parseLoggedInUsers(
          !authenticatedUser.isAuthenticated,
          shouldFetchUserInfo
        );
        setLoggedInUsers(response);
      } catch (error) {
        // TODO handle error here. We might want to add metrics and/or show error to users depending on what the backend returns.
        console.warn('account switching has issues', error);
      } finally {
        setIsGettingLoggedInUsers(false);
      }
    };
    // eslint-disable-next-line no-void
    void fetchData();
  }, []);

  return { loggedInUsers, isGettingLoggedInUsers };
}

export default useLoggedInUsers;
