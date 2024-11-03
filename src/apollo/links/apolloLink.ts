import { ApolloLink } from '@apollo/client';
import CSRF_TOKEN_HEADER from '../../constants/csrfTokenHeader';
import { Window } from '../../types/Window';

const apolloLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      [CSRF_TOKEN_HEADER]: (window as Window).Roblox?.XsrfToken?.getToken?.()
    }
  }));
  return forward(operation);
});

export default apolloLink;
