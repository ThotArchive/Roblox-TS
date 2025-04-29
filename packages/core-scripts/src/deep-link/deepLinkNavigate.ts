import {
  buildDeepLinkLaunchGameEvent,
  buildResolveLinkEvent,
  CounterEvents,
  DeepLink,
  DeepLinkNavigationMap,
  PathPart,
  ItemTypePathMap,
  UrlPart,
  DeepLinkParams,
} from "./deepLinkConstants";
import { launchGame, buildPlayGameProperties } from "../game";
import { startDesktopAndMobileWebChat } from "../util/chat";
import { sendEventWithTarget } from "../event-stream";
import getPlaceIdFromUniverseId from "./getPlaceIdFromUniverseId";
import resolveShareLinks from "./resolveShareLinks";
import { getQueryParam, getHelpDeskUrl, ZendeskDeepLinkParams } from "../util/url";
import {
  ProfileShareFriendshipSourceType,
  ShareLinksType,
  ExperienceJoinData,
} from "./shareLinksTypes";
import ExperienceInviteStatus from "./enums/ExperienceInviteStatus";
import FriendInviteStatus from "./enums/FriendInviteStatus";
import ProfileShareStatus from "./enums/ProfileShareStatus";
import ScreenshotInviteStatus from "./enums/ScreenshotInviteStatus";
import PrivateServerLinkStatus from "./enums/PrivateServerLinkStatus";
import ExperienceDetailsStatus from "./enums/ExperienceDetailsStatus";
import ExternalWebUrlDomains from "./enums/ExternalWebUrlDomains";
import AvatarItemDetailsStatus from "./enums/AvatarItemDetailsStatus";
import ExperienceAffiliateStatus from "./enums/ExperienceAffiliateStatus";
import ContentPostStatus from "./enums/ContentPostStatus";
import ExperienceEventStatus from "./enums/ExperienceEventStatus";
import ExperienceAffiliateDeepLinkFallbackType from "./enums/ExperienceAffiliateDeepLinkFallbackType";

const fireEvent = window.EventTracker?.fireEvent;

const isItemDeeplink = (navigateSubPath: string, params: DeepLinkParams) =>
  navigateSubPath === PathPart.ItemDetails.valueOf() && params.itemType && params.itemId;

const getFriendshipSourceType = (source: string | undefined): ProfileShareFriendshipSourceType => {
  switch (source?.toLowerCase()) {
    case ProfileShareFriendshipSourceType.PROFILE_SHARE.toLowerCase():
      return ProfileShareFriendshipSourceType.PROFILE_SHARE;
    case ProfileShareFriendshipSourceType.QR_CODE.toLowerCase():
      return ProfileShareFriendshipSourceType.QR_CODE;
    case undefined:
    default:
      return ProfileShareFriendshipSourceType.QR_CODE;
  }
};

const buildRedirectUrlWithJoinData = (url: string, joinData: ExperienceJoinData): string => {
  const [baseUrl, queryString] = url.split("?");
  const searchParams = new URLSearchParams(queryString);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (joinData) {
    if (joinData.launchData && joinData.launchData !== "") {
      searchParams.append("launchData", joinData.launchData);
    }
    if (joinData.experienceEventId && joinData.experienceEventId !== "") {
      searchParams.append("eventId", joinData.experienceEventId);
    }
  }
  return `${baseUrl}?${searchParams.toString()}`;
};

const deepLinkNavigate = (target: DeepLink): Promise<boolean> => {
  const { path, params } = target;
  let urlTarget: string | undefined;

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const navigateSubPath = path[1]!;
  if (DeepLinkNavigationMap[navigateSubPath]) {
    urlTarget = DeepLinkNavigationMap[navigateSubPath];
    // For simple mapping of deepLink parameters to url parameters
    // More complex deepLink handling defined below
    for (const [key, value] of Object.entries(params)) {
      urlTarget = urlTarget.replace(`{${key}}`, value);
    }
  } else if (isItemDeeplink(navigateSubPath, params)) {
    // This branch is for parsing
    // roblox://navigation/item_details?itemType=<itemType>&itemId=<itemId>
    // @ts-expect-error TODO: old, migrated code
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
    urlTarget = UrlPart.GiftCards;
  } else if (navigateSubPath === PathPart.ShareLinks) {
    // roblox://navigation/share_links?code=<linkId>&type=<linkType>
    switch (params.type) {
      case ShareLinksType.EXPERIENCE_INVITE: {
        if (params.code != null) {
          const { code } = params;
          return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.experienceInviteData;
              if (data?.placeId == null) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.EXPERIENCE_INVITE,
              );
              sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );
              if (data.status === ExperienceInviteStatus.VALID && data.instanceId) {
                window.location.href = `${UrlPart.Games}/${data.placeId}`;
                launchGame(
                  buildPlayGameProperties(
                    // @ts-expect-error TODO: old, migrated code
                    data.placeId,
                    data.placeId,
                    data.instanceId,
                    undefined, // playerId
                    undefined, // privateServerLinkCode
                    data.inviterId,
                  ),
                  buildDeepLinkLaunchGameEvent(data.placeId.toString(), code, data.status),
                );
                return true;
              }
              if (
                data.status === ExperienceInviteStatus.EXPIRED ||
                data.status === ExperienceInviteStatus.INVITER_NOT_IN_EXPERIENCE
              ) {
                window.localStorage.setItem(
                  "ref_info",
                  btoa(JSON.stringify({ [data.placeId.toString()]: data.inviterId.toString() })),
                );
                window.location.href = `${UrlPart.Games}/${data.placeId}?experienceInviteLinkId=${params.code}&experienceInviteStatus=${data.status}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent?.(CounterEvents.InviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE: {
        if (params.code) {
          return resolveShareLinks(params.code, ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.notificationExperienceInviteData;
              if (data?.placeId) {
                const includeInstanceId =
                  data.instanceId && data.status === ExperienceInviteStatus.VALID;
                const launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}${
                  data.launchData
                    ? `&launchData=${encodeURIComponent(encodeURIComponent(data.launchData))}`
                    : ""
                }${includeInstanceId ? `&gameInstanceId=${data.instanceId}` : ""}${
                  data.inviterId ? `&referredByPlayerId=${data.inviterId}` : ""
                }`;
                // TODO: old, migrated code
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                window.Roblox.ProtocolHandlerClientInterface!.startGameWithDeepLinkUrl(
                  launchLink,
                  data.placeId,
                );
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent?.(CounterEvents.NotificationInviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.FRIEND_INVITE: {
        if (params.code) {
          const { code } = params;
          return resolveShareLinks(params.code, ShareLinksType.FRIEND_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.friendInviteData;
              if (data?.senderUserId == null) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.FRIEND_INVITE,
              );
              sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
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
              fireEvent?.(CounterEvents.FriendRequestResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.PROFILE: {
        if (params.code) {
          const { code } = params;
          return resolveShareLinks(params.code, ShareLinksType.PROFILE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.profileLinkResolutionResponseData;
              if (data?.userId == null) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.PROFILE,
              );
              sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );
              if (data.status === ProfileShareStatus.VALID) {
                // TODO: old, migrated code
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const profileShareSource = getQueryParam("source") as string;
                const friendshipSourceType = getFriendshipSourceType(profileShareSource);
                window.location.href = `${UrlPart.Users}/${data.userId}${UrlPart.Profile}?friendshipSourceType=${friendshipSourceType}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              fireEvent?.(CounterEvents.ProfileShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SCREENSHOT_INVITE: {
        if (params.code) {
          const { code } = params;
          return resolveShareLinks(params.code, ShareLinksType.SCREENSHOT_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.screenshotInviteData;
              if (
                data?.placeId == null ||
                ![
                  ScreenshotInviteStatus.EXPIRED,
                  ScreenshotInviteStatus.INVITER_NOT_IN_EXPERIENCE,
                  ScreenshotInviteStatus.VALID,
                ].includes(data.status)
              ) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.SCREENSHOT_INVITE,
              );
              sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
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
                  encodeURIComponent(data.launchData),
                )}`;
              }
              if (data.instanceId) {
                launchLink += `&gameInstanceId=${data.instanceId}`;
              }
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              window.Roblox.ProtocolHandlerClientInterface!.startGameWithDeepLinkUrl(
                launchLink,
                data.placeId,
              );
              return true;
            })
            .catch(() => {
              fireEvent?.(CounterEvents.ScreenshotInviteShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SERVER: {
        if (params.code) {
          const { code } = params;
          return resolveShareLinks(params.code, ShareLinksType.SERVER)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.privateServerInviteData;

              if (
                data?.universeId == null ||
                ![PrivateServerLinkStatus.VALID, PrivateServerLinkStatus.EXPIRED].includes(
                  data.status,
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
                    code,
                    ShareLinksType.SERVER,
                  );

                  sendEventWithTarget(
                    resolveLinkEvent.type,
                    resolveLinkEvent.context,
                    resolveLinkEvent.params,
                  );

                  window.location.href = `${UrlPart.Games}/${rootPlaceId}?privateServerLinkCode=${data.linkCode}`;
                  return true;
                })
                .catch(() => false);

              return true;
            })
            .catch(() => {
              fireEvent?.(CounterEvents.PrivateServerLinkResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.EXPERIENCE_AFFILIATE: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_AFFILIATE)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceAffiliateData;
            if (data?.status !== ExperienceAffiliateStatus.VALID) {
              return false;
            }
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data?.universeId == null) {
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.EXPERIENCE_AFFILIATE,
              );
              sendEventWithTarget(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );

              // There is no universeId, check if it was resolved to fallback to profile
              if (
                data.fallbackType === ExperienceAffiliateDeepLinkFallbackType.PROFILE &&
                data.fallbackId
              ) {
                // Redirect to the profile page
                window.location.href = `${UrlPart.Users}/${data.fallbackId}${UrlPart.Profile}`;
              } else {
                const referralUrl = `${window.location.protocol}/${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
                window.location.href = `/?referralUrl=${encodeURIComponent(referralUrl)}`;
              }

              return true;
            }

            return getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  code,
                  ShareLinksType.EXPERIENCE_AFFILIATE,
                );
                sendEventWithTarget(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params,
                );

                const referralUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
                let redirectUrl = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${
                  ShareLinksType.EXPERIENCE_AFFILIATE
                }&referralUrl=${encodeURIComponent(referralUrl)}`;
                // TODO: old, migrated code
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                redirectUrl = buildRedirectUrlWithJoinData(redirectUrl, data.joinData!);
                window.location.href = redirectUrl;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            fireEvent?.(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_DETAILS: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_DETAILS)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceDetailsInviteData;

            if (data?.universeId == null || data.status !== ExperienceDetailsStatus.VALID) {
              return false;
            }

            return getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  code,
                  ShareLinksType.EXPERIENCE_DETAILS,
                );
                sendEventWithTarget(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params,
                );

                window.location.href = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${ShareLinksType.EXPERIENCE_DETAILS}`;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            fireEvent?.(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.AVATAR_ITEM_DETAILS: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return resolveShareLinks(params.code, ShareLinksType.AVATAR_ITEM_DETAILS)
          .then(response => {
            //
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.avatarItemDetailsData;

            if (
              data?.itemId == null ||
              data.itemId === "" ||
              data.itemId === "0" ||
              !(data.itemType in UrlPart) ||
              data.status !== AvatarItemDetailsStatus.VALID
            ) {
              return false;
            }

            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const itemType = data.itemType as "Asset" | "Bundle" | "Look";
            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              code,
              ShareLinksType.AVATAR_ITEM_DETAILS,
            );
            sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            window.location.href = `${UrlPart[itemType]}/${data.itemId}?pid=share&is_retargeting=true&deep_link_value=${params.code}`;
            return true;
          })
          .catch(() => {
            fireEvent?.(CounterEvents.AvatarItemDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.CONTENT_POST: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return resolveShareLinks(params.code, ShareLinksType.CONTENT_POST)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.contentPostData;

            if (!data || data.status !== ContentPostStatus.VALID) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              code,
              ShareLinksType.CONTENT_POST,
            );
            sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            window.location.href = `${UrlPart.AppLauncher}${UrlPart.ContentPost}?userId=${data.postCreatorId}&postId=${data.postId}`;
            window.location.href = `${UrlPart.Users}/${data.postCreatorId}${UrlPart.Profile}`;
            return true;
          })
          .catch(() => {
            fireEvent?.(CounterEvents.ContentPostResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_EVENT: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_EVENT)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceEventData;

            if (
              data?.universeId == null ||
              !data.placeId ||
              data.status !== ExperienceEventStatus.VALID
            ) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              code,
              ShareLinksType.EXPERIENCE_EVENT,
            );
            sendEventWithTarget(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            // TODO (xueyinwang): Support redirection with a separate Status when product needs come
            let launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}`;
            launchLink = buildRedirectUrlWithJoinData(launchLink, data.joinData);
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            window.Roblox.ProtocolHandlerClientInterface!.startGameWithDeepLinkUrl(
              launchLink,
              data.placeId,
            );
            return true;
          })
          .catch(() => {
            fireEvent?.(CounterEvents.ExperienceEventResolutionFailed);
            return false;
          });
      }
      case undefined:
      default: {
        break;
      }
    }
  } else if (navigateSubPath === PathPart.Chat && params.userId) {
    startDesktopAndMobileWebChat(params);
    return Promise.resolve(true);
  } else if (navigateSubPath === PathPart.ExternalWebUrl) {
    // roblox://navigation/external_web_link?domain=zendesk&locale=ko&articleId=1234&type=policy_update
    let zendeskUrl;
    if (params.domain === ExternalWebUrlDomains.Zendesk) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { articleId, locale } = params as ZendeskDeepLinkParams;
      zendeskUrl = getHelpDeskUrl(locale, articleId);
      if (zendeskUrl) {
        window.open(zendeskUrl, "_blank");
      }
    }
    return Promise.resolve(!!zendeskUrl);
  } else if (navigateSubPath === PathPart.Avatar) {
    // roblox://navigation/avatar
    if (!Object.keys(params).length) {
      // roblox://navigation/avatar
      // Navigate to my avatar page
      urlTarget = UrlPart.Avatar;
    } else {
      // roblox://navigation/avatar?itemId=<itemId>&itemType=<itemType>
      // Navigate to avatar details UA
      urlTarget = target.url;
    }
  } else if (navigateSubPath === PathPart.Group) {
    if (params.groupId) {
      if (params.forumCategoryId && params.forumPostId && params.forumCommentId) {
        // roblox://navigation/group?groupId=<groupId>&forumCategoryId=<forumCategoryId>&forumPostId=<forumPostId>&forumCommentId=<forumCommentId>
        urlTarget = `${UrlPart.Groups}/${params.groupId}#!/forums/${params.forumCategoryId}/post/${params.forumPostId}/comment/${params.forumCommentId}`;
      } else {
        // roblox://navigation/group?groupId=<groupId>
        urlTarget = `${UrlPart.Groups}/${params.groupId}`;
      }
    }
  }

  if (urlTarget) {
    window.location.href = urlTarget;
  } else {
    fireEvent?.(CounterEvents.NavigationFailed);
  }
  return Promise.resolve(!!urlTarget);
};

export default deepLinkNavigate;
