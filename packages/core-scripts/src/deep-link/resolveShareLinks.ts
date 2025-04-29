import environmentUrls from "@rbx/environment-urls";
import { post } from "../http";
import {
  AvatarItemDetailsData,
  ContentPostData,
  ExperienceInviteData,
  FriendInviteData,
  PrivateServerLinkData,
  ProfileData,
  ScreenshotInviteData,
  ExperienceDetailsData,
  ExperienceAffiliateData,
  ExperienceEventData,
  ShareLinksType,
} from "./shareLinksTypes";

const ResolveShareLinksUrlConfig = {
  url: `${environmentUrls.shareLinksApi}/v1/resolve-link`,
  withCredentials: true,
};

export type ResolveShareLinksResponse = {
  avatarItemDetailsData?: AvatarItemDetailsData;
  contentPostData?: ContentPostData;
  experienceInviteData?: ExperienceInviteData;
  friendInviteData?: FriendInviteData;
  notificationExperienceInviteData?: ExperienceInviteData;
  profileLinkResolutionResponseData?: ProfileData;
  experienceAffiliateData?: ExperienceAffiliateData;
  screenshotInviteData?: ScreenshotInviteData;
  privateServerInviteData?: PrivateServerLinkData;
  experienceDetailsInviteData?: ExperienceDetailsData;
  experienceEventData?: ExperienceEventData;
};

const resolveShareLinks = (
  linkId: string,
  linkType: ShareLinksType,
): Promise<{ data: ResolveShareLinksResponse }> =>
  post<ResolveShareLinksResponse>(ResolveShareLinksUrlConfig, {
    linkId,
    linkType,
  });

export default resolveShareLinks;
