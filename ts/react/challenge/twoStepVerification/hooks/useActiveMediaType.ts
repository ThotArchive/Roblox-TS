import { matchPath, useLocation } from 'react-router';
import { MediaType } from '../interface';

/**
 * A hook to retrieve the current media type from the page's router.
 */
export const useActiveMediaType: () => MediaType | null = () => {
  const location = useLocation();
  const match = matchPath<{ activeMediaType: MediaType }>(location.pathname, {
    path: '/:activeMediaType',
    exact: true,
    strict: false
  });

  return match?.params ? match?.params.activeMediaType : null;
};

/**
 * A helper function to turn a media type into a pushable path.
 */
export const mediaTypeToPath: (mediaType: MediaType | null) => string = mediaType =>
  `/${mediaType || ''}`;
