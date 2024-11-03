import { ApolloClient, from } from '@apollo/client';
import apolloLink from './links/apolloLink';
import restLink from './links/restLink';
import retryLink from './links/retryLink';
import persistCache from './cache/persistCache';
import InMemoryCacheWithTTL from './cache/InMemoryCacheWithTTL';

const cache = new InMemoryCacheWithTTL();

const apolloClient = new ApolloClient({
  link: from([retryLink, apolloLink, restLink]),
  cache,
  connectToDevTools: false
});

persistCache(apolloClient, cache);

export default apolloClient;
