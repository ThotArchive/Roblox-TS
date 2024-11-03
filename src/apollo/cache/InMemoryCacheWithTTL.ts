import { InMemoryCache, Cache } from '@apollo/client';
import persistentCacheService from './persistentCacheService';

export default class InMemoryCacheWithTTL extends InMemoryCache {
  writeQuery<TData, TVariables>(options: Cache.WriteQueryOptions<TData, TVariables>) {
    persistentCacheService.updateCreatedTimestampForKey((options.variables as any).userIds);
    return super.writeQuery(options);
  }
}
