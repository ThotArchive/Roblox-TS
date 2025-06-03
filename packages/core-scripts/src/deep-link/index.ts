import "../global";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { DeepLink, DeepLinkParams, PathPart } from "./deepLinkConstants";
import deepLinkNavigate from "./deepLinkNavigate";
import deepLinkGameJoin from "./deepLinkGameJoin";
import deepLinkFollowUserToExperience from "./deepLinkFollowUserToExperience";
import AvatarItemDetailsStatus from "./enums/AvatarItemDetailsStatus";
import ContentPostStatus from "./enums/ContentPostStatus";
import ExperienceInviteStatus from "./enums/ExperienceInviteStatus";
import FriendInviteStatus from "./enums/FriendInviteStatus";
import ProfileShareStatus from "./enums/ProfileShareStatus";
import PrivateServerLinkStatus from "./enums/PrivateServerLinkStatus";
import ExperienceAffiliateStatus from "./enums/ExperienceAffiliateStatus";
import { ShareLinksType } from "./shareLinksTypes";
import deepLinkGroup from "./deepLinkGroup";
import ExperienceEventStatus from "./enums/ExperienceEventStatus";

const { Hybrid } = window.Roblox;

const firstUriSegmentToHandler: Record<string, (target: DeepLink) => Promise<boolean>> = {
  [PathPart.Navigation]: deepLinkNavigate,
  [PathPart.PlaceId]: deepLinkGameJoin,
  [PathPart.UserId]: deepLinkFollowUserToExperience,
  [PathPart.Group]: deepLinkGroup,
};

const pathRegex = /\/(\w+)/g; // matches: /(pathSegment)
const paramRegex = /(\w+)=([^&=]+)/g; // matches: (param)=(value)

const HYBRID_TARGET_KEY = "feature";
const HYBRID_TARGET_VALUE = "DeepLink";
const HYBRID_TARGET_PARAM_KEY = "deepLinkUrlPath";

const parseDeepLink = (deepLinkString: string): DeepLink => {
  const path: PathPart[] = [];
  const params: DeepLinkParams = {};
  const url: string = deepLinkString;

  let pathPart = pathRegex.exec(deepLinkString);
  while (pathPart != null) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    path.push(pathPart[1] as PathPart);
    pathPart = pathRegex.exec(deepLinkString);
  }

  let paramPart = paramRegex.exec(deepLinkString);
  while (paramPart != null) {
    const [, key, value] = paramPart;
    // @ts-expect-error Regex has two capture groups
    params[key] = value;
    paramPart = paramRegex.exec(deepLinkString);
  }

  return {
    path,
    params,
    url,
  };
};

const navigateToDeepLink = (deepLinkUrl: string): Promise<boolean> => {
  if (getDeviceMeta()?.isIosApp && Hybrid) {
    Hybrid.Navigation?.navigateToFeature(
      {
        [HYBRID_TARGET_KEY]: HYBRID_TARGET_VALUE,
        [HYBRID_TARGET_PARAM_KEY]: deepLinkUrl,
      },
      () => true,
    );
    return Promise.resolve(true);
  }
  if (getDeviceMeta()?.isInApp) {
    // use lua deeplinks map to resolve url if in universal app
    // https://github.com/Roblox/lua-apps/blob/master/src/internal/LuaApp/Modules/LuaApp/DeepLinks/DeepLinkMap.lua
    window.location.href = deepLinkUrl;
    return Promise.resolve(true);
  }
  const target: DeepLink = parseDeepLink(deepLinkUrl);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const path = target.path[0]!;
  const handler = firstUriSegmentToHandler[path];
  return handler ? handler(target) : Promise.resolve(false);
};

const ShareLinks = {
  AvatarItemDetailsStatus,
  ContentPostStatus,
  ExperienceInviteStatus,
  FriendInviteStatus,
  ProfileShareStatus,
  PrivateServerLinkStatus,
  ExperienceAffiliateStatus,
  ExperienceEventStatus,
};

export { parseDeepLink, navigateToDeepLink, ShareLinksType, ShareLinks };
