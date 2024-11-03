import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { persistCache as persistApolloCache, SessionStorageWrapper } from 'apollo3-cache-persist';
import InMemoryCacheWithTTL from './InMemoryCacheWithTTL';
import persistentCacheService from './persistentCacheService';
import { APOLLO_CACHE_KEY } from '../../constants/cacheConstants';
import { ROBLOX_LOGOUT_EVENT } from '../../constants/robloxEvents';
import { Window } from '../../types/Window';

/**
 * Persists the Apollo cache to window.sessionStorage, with cache key TTLs.
 *
 * Whenever the user logs out or the authenticated user changes, the cache is
 * invalidated to prevent other users from accessing alias/contact name
 * information from other users.
 *
 * On page load, any expired cache keys in the Apollo cache will be invalidated.
 */
const persistCache = async (apolloClient: ApolloClient<NormalizedCacheObject>, cache: InMemoryCacheWithTTL) => {
  if (!window.sessionStorage) {
    return;
  }

  // Invalidate the cache whenever the user logs out
  document.addEventListener(ROBLOX_LOGOUT_EVENT, () => {
    persistentCacheService.invalidateCache();
  });

  // Invalidate the cache if the cached userId and the current userId are different
  const currentUserId = (window as Window).Roblox?.CurrentUser?.userId ?? null;
  const cachedUserId = persistentCacheService.getCachedUserId() ?? null;
  if (currentUserId !== cachedUserId) {
    persistentCacheService.invalidateCache(currentUserId);
  }

  // Invalidate any expired keys before persisting Apollo cache
  persistentCacheService.invalidateExpiredKeys();

  await persistApolloCache({
    cache,
    storage: new SessionStorageWrapper(window.sessionStorage),
    key: APOLLO_CACHE_KEY,
    maxSize: 1_048_576 // 1 MB
  }).catch(() => undefined);

  const client = apolloClient;
  client.cache = cache;

  // Re-initialize Apollo cache from storage after persisting cache
  persistentCacheService.initializeApolloCacheFromStorage();
};

export default persistCache;
