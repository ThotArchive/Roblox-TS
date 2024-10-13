import { EnvironmentUrls } from 'Roblox';
import { httpService } from '../../http/http';
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
  ShareLinksType
} from './shareLinksTypes';

const ResolveShareLinksUrlConfig = {
  url: `${EnvironmentUrls.shareLinksApi}/v1/resolve-link`,
  withCredentials: true
};

export type ResolveShareLinksResponse = {
  data?: {
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
  };
};

const resolveShareLinks = (
  linkId: string,
  linkType: ShareLinksType
): Promise<ResolveShareLinksResponse> => {
  return httpService
    .post(ResolveShareLinksUrlConfig, {
      linkId,
      linkType
    })
    .then((response: ResolveShareLinksResponse) => {
      return response;
    });
};

export default resolveShareLinks;
