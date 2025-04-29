import { matchPath, useLocation } from 'react-router';
import { ReauthenticationType } from '../interface';

/**
 * A hook to retrieve the current reauthentication type from the page's router.
 */
export const useActiveReauthenticationType: () => ReauthenticationType | null = () => {
  const location = useLocation();
  const match = matchPath<{ activeReauthenticationType: ReauthenticationType }>(location.pathname, {
    path: '/:activeReauthenticationType',
    exact: true,
    strict: false
  });

  return match?.params ? match?.params.activeReauthenticationType : null;
};

/**
 * A helper function to turn a reauthentication type into a pushable path.
 */
export const reauthenticationTypeToPath: (
  reauthenticationType: ReauthenticationType | null
) => string = reauthenticationType => `/${reauthenticationType || ''}`;
