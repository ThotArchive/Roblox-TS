import { httpService } from 'core-utilities';
import { TSecureAuthIntent } from 'core-roblox-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as SessionManagement from '../types/sessionManagement';

export const getSessions = async (
  nextCursor?: string,
  desiredLimit?: string
): Promise<
  Result<SessionManagement.GetSessionsReturnType, SessionManagement.SessionManagementError | null>
> =>
  toResult(
    httpService.get(SessionManagement.GET_SESSIONS_CONFIG, { nextCursor, desiredLimit }),
    SessionManagement.SessionManagementError
  );

export const logoutSession = async (
  token: string
): Promise<
  Result<SessionManagement.LogoutSessionReturnType, SessionManagement.SessionManagementError | null>
> =>
  toResult(
    httpService.post(SessionManagement.LOGOUT_SESSION_CONFIG, { token }),
    SessionManagement.SessionManagementError
  );

export const logoutFromAllSessionsAndReauthenticate = async (
  secureAuthenticationIntent: TSecureAuthIntent
): Promise<
  Result<SessionManagement.LogoutFromAllSessionsReturnType, SessionManagement.AuthError | null>
> =>
  toResult(
    httpService.post(SessionManagement.LOGOUT_FROM_ALL_SESSIONS_CONFIG, {
      secureAuthenticationIntent
    }),
    SessionManagement.AuthError
  );
