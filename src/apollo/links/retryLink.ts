import { RetryLink } from '@apollo/client/link/retry';
import { Window } from '../../types/Window';
import CSRF_TOKEN_HEADER from '../../constants/csrfTokenHeader';

export const MAX_RETRY_ATTEMPTS = 3;
const RETRY_STATUS_CODES = new Set([
  403, // Forbidden
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504 // Gateway Timeout
]);

const retryLink = new RetryLink({
  attempts: {
    max: MAX_RETRY_ATTEMPTS,
    retryIf: (error, _operation) => {
      const csrfToken = error?.response?.headers?.get(CSRF_TOKEN_HEADER);
      if (error?.statusCode === 403 && csrfToken) {
        (window as Window).Roblox?.XsrfToken?.setToken?.(csrfToken);
      }
      return RETRY_STATUS_CODES.has(error?.statusCode);
    }
  },
  delay: {
    initial: 100,
    jitter: true
  }
});

export default retryLink;
