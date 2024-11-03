import { APOLLO_CACHE_KEY, TTL_CACHE_KEY, TTL_IN_MS } from '../../constants/cacheConstants';
import { ApolloCache, TTLCache } from '../../types/Cache';
import UserProfileDetails from '../../types/UserProfileDetails';

export class PersistentCacheService {
  private storage?: Storage;

  private apolloCache: ApolloCache;

  private ttlCache: TTLCache;

  constructor() {
    this.apolloCache = {};
    this.ttlCache = { keys: {} };

    if (!window.sessionStorage) {
      return;
    }

    this.storage = window.sessionStorage;
    this.initializeApolloCacheFromStorage();
    this.initializeTTLCacheFromStorage();
  }

  public getCachedUserId(): string | null | undefined {
    return this.ttlCache.userId;
  }

  public invalidateExpiredKeys(): void {
    if (!this.apolloCache.ROOT_QUERY) {
      return;
    }

    Object.entries(this.ttlCache.keys).forEach(([key, createdTimestamp]) => {
      if (this.isExpiredTimestamp(createdTimestamp)) {
        delete this.ttlCache.keys[key];
        delete this.apolloCache.ROOT_QUERY?.[this.getFormattedApolloCacheKey(key)];
      }
    });

    this.syncApolloCacheToStorage();
    this.syncTTLCacheToStorage();
  }

  public updateCreatedTimestampForKey(userIds: number[]): void {
    this.ttlCache.keys[JSON.stringify(userIds)] = Date.now();
    this.syncTTLCacheToStorage();
  }

  public invalidateCache(userId?: string | null): void {
    this.invalidateApolloCache();

    if (userId === undefined || userId === null) {
      // Unauthenticated user
      this.invalidateTTLCache();
    } else {
      // Authenticated user
      this.ttlCache = { userId, keys: {} };
      this.syncTTLCacheToStorage();
    }
  }

  public invalidateApolloCache(): void {
    this.apolloCache = {};
    this.storage?.removeItem(APOLLO_CACHE_KEY);
  }

  public invalidateTTLCache(): void {
    this.ttlCache = { keys: {} };
    this.storage?.removeItem(TTL_CACHE_KEY);
  }

  public getAllCachedProfilesByUserId(
    userId: number
  ): [number[], ({ __typename: 'UserProfiles' } & UserProfileDetails)[]][] {
    if (!this.apolloCache.ROOT_QUERY) {
      return [];
    }

    const userIdRegex = new RegExp(`\\b${userId}\\b`);
    const userIdListRegex = /\[[\d,]*\]/;
    return Object.keys(this.apolloCache.ROOT_QUERY)
      .filter(cacheKey => userIdRegex.test(cacheKey))
      .map(cacheKey => {
        const userIds: number[] = JSON.parse(cacheKey.match(userIdListRegex)?.[0] ?? '[]');
        const cachedProfiles = this.apolloCache.ROOT_QUERY![cacheKey];
        return [userIds, cachedProfiles];
      });
  }

  public initializeApolloCacheFromStorage(): void {
    try {
      this.apolloCache = JSON.parse(this.storage?.getItem(APOLLO_CACHE_KEY) ?? '{}');
    } catch (e) {
      this.storage?.removeItem(APOLLO_CACHE_KEY);
    }
  }

  private initializeTTLCacheFromStorage(): void {
    try {
      this.ttlCache = JSON.parse(this.storage?.getItem(TTL_CACHE_KEY) ?? '{}');
    } catch (e) {
      this.storage?.removeItem(TTL_CACHE_KEY);
    }

    if (!this.ttlCache.keys) {
      this.ttlCache.keys = {};
    }
  }

  private isExpiredTimestamp(timestamp: number): boolean {
    return Date.now() > timestamp + TTL_IN_MS;
  }

  private getFormattedApolloCacheKey(key: string): string {
    return `userProfiles({"userIds":${key}})`;
  }

  private syncApolloCacheToStorage(): void {
    this.storage?.setItem(APOLLO_CACHE_KEY, JSON.stringify(this.apolloCache));
  }

  private syncTTLCacheToStorage(): void {
    this.storage?.setItem(TTL_CACHE_KEY, JSON.stringify(this.ttlCache));
  }
}

const persistentCacheService = new PersistentCacheService();

export default persistentCacheService;
