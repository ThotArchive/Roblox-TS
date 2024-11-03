import { fireEvent } from 'roblox-event-tracker';
import { ProtocolHandlerClientInterface } from 'Roblox';
import {
  buildDeepLinkLaunchGameEvent,
  buildResolveLinkEvent,
  CounterEvents,
  DeepLink,
  DeepLinkNavigationMap,
  PathPart,
  ItemTypePathMap,
  UrlPart,
  DeepLinkParams
} from './deepLinkConstants';
import playGameService from '../playGames/playGameService';
import chatService from '../chatService/chatService';
import eventStreamService from '../eventStreamService/eventStreamService';
import getPlaceIdFromUniverseId from './getPlaceIdFromUniverseId';
import resolveShareLinks from './resolveShareLinks';
import urlService from '../urlService';

import {
  AvatarItemDetailsData,
  ExperienceDetailsData,
  ExperienceInviteData,
  ExperienceAffiliateData,
  PrivateServerLinkData,
  ProfileShareFriendshipSourceType,
  ScreenshotInviteData,
  ShareLinksType,
  ContentPostData,
  ExperienceEventData,
  ExperienceJoinData
} from './shareLinksTypes';
import { ZendeskDeepLinkParams, getZendeskUrl } from './utils/externalWebUrlNavigationHelper';
import ExperienceInviteStatus from './enums/ExperienceInviteStatus';
import FriendInviteStatus from './enums/FriendInviteStatus';
import ProfileShareStatus from './enums/ProfileShareStatus';
import ScreenshotInviteStatus from './enums/ScreenshotInviteStatus';
import PrivateServerLinkStatus from './enums/PrivateServerLinkStatus';
import ExperienceDetailsStatus from './enums/ExperienceDetailsStatus';
import ExternalWebUrlDomains from './enums/ExternalWebUrlDomains';
import AvatarItemDetailsStatus from './enums/AvatarItemDetailsStatus';
import ExperienceAffiliateStatus from './enums/ExperienceAffiliateStatus';
import ContentPostStatus from './enums/ContentPostStatus';
import ExperienceEventStatus from './enums/ExperienceEventStatus';

function isItemDeeplink(navigateSubPath: string, params: DeepLinkParams) {
  return navigateSubPath === PathPart.ItemDetails && params.itemType && params.itemId;
}

function getFriendshipSourceType(source: string | undefined): ProfileShareFriendshipSourceType {
  switch (source?.toLowerCase()) {
    case ProfileShareFriendshipSourceType.PROFILE_SHARE.toLowerCase():
      return ProfileShareFriendshipSourceType.PROFILE_SHARE;
    case ProfileShareFriendshipSourceType.QR_CODE.toLowerCase():
      return ProfileShareFriendshipSourceType.QR_CODE;
    default:
      return ProfileShareFriendshipSourceType.QR_CODE;
  }
}

function buildRedirectUrlWithJoinData(url: string, joinData: ExperienceJoinData): string {
  const [baseUrl, queryString] = url.split('?');
  const searchParams = new URLSearchParams(queryString);
  if (joinData) {
    if (joinData.launchData && joinData.launchData !== '') {
      searchParams.append('launchData', encodeURIComponent(joinData.launchData));
    }
    if (joinData.experienceEventId && joinData.experienceEventId !== 0) {
      searchParams.append('eventId', encodeURIComponent(joinData.experienceEventId));
    }
  }
  return `${baseUrl}?${searchParams.toString()}`;
}

const deepLinkNavigate = (target: DeepLink): Promise<boolean> => {
  const { path, params } = target;
  let urlTarget: string;

  const navigateSubPath = path[1];
  if (DeepLinkNavigationMap[navigateSubPath]) {
    urlTarget = DeepLinkNavigationMap[navigateSubPath];
    // For simple mapping of deepLink parameters to url parameters
    // More complex deepLink handling defined below
    const paramKeys = Object.keys(params);
    for (let i = 0; i < paramKeys.length; i++) {
      const key = paramKeys[i];
      urlTarget = urlTarget.replace(`{${key}}`, params[key]);
    }
  } else if (isItemDeeplink(navigateSubPath, params)) {
    // This branch is for parsing roblox://navigation/item_details?itemType=<itemType>&itemId=<itemId>
    urlTarget = `${ItemTypePathMap[params.itemType]}/${params.itemId}`;
  } else if (navigateSubPath === PathPart.GameDetails && params.gameId) {
    // roblox://navigation/game_details?gameId=<universeId>
    // navigate to game page. Deeplink provides a universe id, but we need a
    // placeId for the url - so we call the game info endpoint first
    return getPlaceIdFromUniverseId(params.gameId)
      .then((rootPlaceId: number) => {
        if (rootPlaceId) {
          window.location.href = `${UrlPart.Games}/${rootPlaceId}`;
          return true;
        }
        return false;
      })
      .catch(() => false);
  } else if (navigateSubPath === PathPart.Profile) {
    if (params.userId) {
      // roblox://navigation/profile?userId=<userId>
      // Navigate to user profile
      urlTarget = `${UrlPart.Users}/${params.userId}${UrlPart.Profile}`;
    } else if (params.groupId) {
      // roblox://navigation/profile?groupId=<groupId>
      // Navigate to group profile
      urlTarget = `${UrlPart.Groups}/${params.groupId}`;
    }
  } else if (navigateSubPath === PathPart.GiftCards) {
    // roblox://navigation/gift_cards
    // Navigate to gift cards page
    urlTarget = `${UrlPart.GiftCards}`;
  } else if (navigateSubPath === PathPart.ShareLinks) {
    // roblox://navigation/share_links?code=<linkId>&type=<linkType>
    switch (params.type) {
      case ShareLinksType.EXPERIENCE_INVITE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_INVITE)
            .then(response => {
              const data = response?.data?.experienceInviteData;
              if (!data || !data.placeId) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                params.code,
                ShareLinksType.EXPERIENCE_INVITE
              );
              eventStreamService.sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params
              );
              if (data.status === ExperienceInviteStatus.VALID && data.instanceId) {
                window.location.href = `${UrlPart.Games}/${data.placeId}`;
                playGameService.launchGame(
                  playGameService.buildPlayGameProperties(
                    data.placeId,
                    data.placeId,
                    data.instanceId,
                    undefined, // playerId
                    undefined, // privateServerLinkCode
                    data.inviterId
                  ),
                  buildDeepLinkLaunchGameEvent(data.placeId.toString(), params.code, data.status)
                );
                return true;
              }
              if (
                data.status === ExperienceInviteStatus.EXPIRED ||
                data.status === ExperienceInviteStatus.INVITER_NOT_IN_EXPERIENCE
              ) {
                window.location.href = `${UrlPart.Games}/${data.placeId}?experienceInviteLinkId=${params.code}&experienceInviteStatus=${data.status}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent(CounterEvents.InviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE)
            .then(response => {
              const data: ExperienceInviteData | null =
                response?.data?.notificationExperienceInviteData;
              if (data?.placeId) {
                const includeInstanceId =
                  data.instanceId && data.status === ExperienceInviteStatus.VALID;
                const launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}${
                  data.launchData
                    ? `&launchData=${encodeURIComponent(encodeURIComponent(data.launchData))}`
                    : ''
                }${includeInstanceId ? `&gameInstanceId=${data.instanceId}` : ''}`;
                ProtocolHandlerClientInterface.startGameWithDeepLinkUrl(launchLink, data.placeId);
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent(CounterEvents.NotificationInviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.FRIEND_INVITE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.FRIEND_INVITE)
            .then(response => {
              const data = response?.data?.friendInviteData;
              if (!data || !data.senderUserId) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                params.code,
                ShareLinksType.FRIEND_INVITE
              );
              eventStreamService.sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params
              );
              if (
                data.status === FriendInviteStatus.VALID ||
                data.status === FriendInviteStatus.CONSUMED ||
                data.status === FriendInviteStatus.EXPIRED
              ) {
                window.location.href = `${UrlPart.Users}/${data.senderUserId}${UrlPart.Profile}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent(CounterEvents.FriendRequestResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.PROFILE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.PROFILE)
            .then(response => {
              const data = response?.data?.profileLinkResolutionResponseData;
              if (!data || !data.userId) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                params.code,
                ShareLinksType.PROFILE
              );
              eventStreamService.sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params
              );
              if (data.status === ProfileShareStatus.VALID) {
                const profileShareSource = urlService.getQueryParam('source') as string;
                const friendshipSourceType = getFriendshipSourceType(profileShareSource);
                window.location.href = `${UrlPart.Users}/${data.userId}${UrlPart.Profile}?friendshipSourceType=${friendshipSourceType}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent(CounterEvents.ProfileShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SCREENSHOT_INVITE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.SCREENSHOT_INVITE)
            .then(response => {
              const data: ScreenshotInviteData | null = response?.data?.screenshotInviteData;
              if (
                !data?.placeId ||
                ![
                  ScreenshotInviteStatus.EXPIRED,
                  ScreenshotInviteStatus.INVITER_NOT_IN_EXPERIENCE,
                  ScreenshotInviteStatus.VALID
                ].includes(data.status)
              ) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                params.code,
                ShareLinksType.SCREENSHOT_INVITE
              );
              eventStreamService.sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params
              );

              if (
                data.status === ScreenshotInviteStatus.EXPIRED ||
                data.status === ScreenshotInviteStatus.INVITER_NOT_IN_EXPERIENCE
              ) {
                window.location.href = `${UrlPart.Games}/${data.placeId}?experienceInviteLinkId=${params.code}&experienceInviteStatus=${data.status}`;
                return true;
              }

              let launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}`;
              if (data.launchData) {
                launchLink += `&launchData=${encodeURIComponent(
                  encodeURIComponent(data.launchData)
                )}`;
              }
              if (data.instanceId) {
                launchLink += `&gameInstanceId=${data.instanceId}`;
              }
              ProtocolHandlerClientInterface.startGameWithDeepLinkUrl(launchLink, data.placeId);
              return true;
            })
            .catch(() => {
              fireEvent(CounterEvents.ScreenshotInviteShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SERVER: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.SERVER)
            .then(response => {
              const data: PrivateServerLinkData | null = response?.data?.privateServerInviteData;

              if (
                !data ||
                !data.universeId ||
                ![PrivateServerLinkStatus.VALID, PrivateServerLinkStatus.EXPIRED].includes(
                  data.status
                )
              ) {
                return false;
              }

              getPlaceIdFromUniverseId(data.universeId.toString())
                .then((rootPlaceId: number) => {
                  if (!rootPlaceId) {
                    return false;
                  }

                  const resolveLinkEvent = buildResolveLinkEvent(
                    data.status,
                    params.code,
                    ShareLinksType.SERVER
                  );

                  eventStreamService.sendEventWithTarget(
                    resolveLinkEvent.type,
                    resolveLinkEvent.context,
                    resolveLinkEvent.params
                  );

                  window.location.href = `${UrlPart.Games}/${rootPlaceId}?privateServerLinkCode=${data.linkCode}`;
                  return true;
                })
                .catch(() => false);

              return true;
            })
            .catch(() => {
              fireEvent(CounterEvents.PrivateServerLinkResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.EXPERIENCE_AFFILIATE: {
        if (!params.code) {
          break;
        }

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_AFFILIATE)
          .then(response => {
            const data: ExperienceAffiliateData | null = response?.data?.experienceAffiliateData;
            if (data.status !== ExperienceAffiliateStatus.VALID) {
              return false;
            }
            if (!data || !data.universeId) {
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                params.code,
                ShareLinksType.EXPERIENCE_AFFILIATE
              );
              eventStreamService.sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params
              );

              const referralUrl = `${window.location.protocol}/${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
              window.location.href = `/?referralUrl=${encodeURIComponent(referralUrl)}`;
              return true;
            }

            return getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  params.code,
                  ShareLinksType.EXPERIENCE_AFFILIATE
                );
                eventStreamService.sendEventWithTarget(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params
                );

                const referralUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
                let redirectUrl = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${
                  ShareLinksType.EXPERIENCE_AFFILIATE
                }&referralUrl=${encodeURIComponent(referralUrl)}`;
                redirectUrl = buildRedirectUrlWithJoinData(redirectUrl, data.joinData);
                window.location.href = redirectUrl;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            fireEvent(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_DETAILS: {
        if (!params.code) {
          break;
        }

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_DETAILS)
          .then(response => {
            const data: ExperienceDetailsData | null = response?.data?.experienceDetailsInviteData;

            if (!data || !data.universeId || data.status !== ExperienceDetailsStatus.VALID) {
              return false;
            }

            return getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  params.code,
                  ShareLinksType.EXPERIENCE_DETAILS
                );
                eventStreamService.sendEventWithTarget(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params
                );

                window.location.href = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${ShareLinksType.EXPERIENCE_DETAILS}`;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            fireEvent(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.AVATAR_ITEM_DETAILS: {
        if (!params.code) {
          break;
        }

        return resolveShareLinks(params.code, ShareLinksType.AVATAR_ITEM_DETAILS)
          .then(response => {
            const data: AvatarItemDetailsData | null = response?.data?.avatarItemDetailsData;

            if (
              !data ||
              !data.itemId ||
              data.itemId === '' ||
              data.itemId === '0' ||
              !data.itemType ||
              !(data.itemType in UrlPart) ||
              data.status !== AvatarItemDetailsStatus.VALID
            ) {
              return false;
            }

            const itemType = data.itemType as 'Asset' | 'Bundle' | 'Look';
            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              params.code,
              ShareLinksType.AVATAR_ITEM_DETAILS
            );
            eventStreamService.sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params
            );

            window.location.href = `${UrlPart[itemType]}/${data.itemId}?pid=share&is_retargeting=true&deep_link_value=${params.code}`;
            return true;
          })
          .catch(() => {
            fireEvent(CounterEvents.AvatarItemDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.CONTENT_POST: {
        if (!params.code) {
          break;
        }

        return resolveShareLinks(params.code, ShareLinksType.CONTENT_POST)
          .then(response => {
            const data: ContentPostData | null = response?.data?.contentPostData;

            if (!data || data.status !== ContentPostStatus.VALID) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              params.code,
              ShareLinksType.CONTENT_POST
            );
            eventStreamService.sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params
            );

            window.location.href = `${UrlPart.AppLauncher}${UrlPart.ContentPost}?userId=${data.postCreatorId}&postId=${data.postId}`;
            window.location.href = `${UrlPart.Users}/${data.postCreatorId}${UrlPart.Profile}`;
            return true;
          })
          .catch(() => {
            fireEvent(CounterEvents.ContentPostResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_EVENT: {
        if (!params.code) {
          break;
        }

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_EVENT)
          .then(response => {
            const data: ExperienceEventData | null = response?.data?.experienceEventData;

            if (
              !data ||
              !data.universeId ||
              !data.placeId ||
              data.status !== ExperienceEventStatus.VALID
            ) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              params.code,
              ShareLinksType.EXPERIENCE_EVENT
            );
            eventStreamService.sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params
            );

            // TODO (xueyinwang): Support redirection with a separate Status when product needs come
            let launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}`;
            launchLink = buildRedirectUrlWithJoinData(launchLink, data.joinData);
            ProtocolHandlerClientInterface.startGameWithDeepLinkUrl(launchLink, data.placeId);
            return true;
          })
          .catch(() => {
            fireEvent(CounterEvents.ExperienceEventResolutionFailed);
            return false;
          });
      }
      default: {
        break;
      }
    }
  } else if (navigateSubPath === PathPart.Chat && params.userId) {
    chatService.startDesktopAndMobileWebChat(params);
    return Promise.resolve(true);
  } else if (navigateSubPath === PathPart.ExternalWebUrl) {
    // roblox://navigation/external_web_link?domain=zendesk&locale=ko&articleId=1234&type=policy_update
    let zendeskUrl;
    if (params.domain === ExternalWebUrlDomains.Zendesk) {
      const zendeskParams = params as ZendeskDeepLinkParams;
      zendeskUrl = getZendeskUrl(zendeskParams);
      if (zendeskUrl) {
        window.open(zendeskUrl, '_blank');
      }
    }
    return Promise.resolve(!!zendeskUrl);
  } else if (navigateSubPath === PathPart.Avatar) {
    // roblox://navigation/avatar
    if (!Object.keys(params).length) {
      // roblox://navigation/avatar
      // Navigate to my avatar page
      urlTarget = `${UrlPart.Avatar}`;
    } else {
      // roblox://navigation/avatar?itemId=<itemId>&itemType=<itemType>
      // Navigate to avatar details UA
      urlTarget = target.url;
    }
  }

  if (urlTarget) {
    window.location.href = urlTarget;
  } else {
    fireEvent(CounterEvents.NavigationFailed);
  }
  return Promise.resolve(!!urlTarget);
};

export default deepLinkNavigate;
