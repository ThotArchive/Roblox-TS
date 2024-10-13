import ExperienceInviteStatus from './enums/ExperienceInviteStatus';
import FriendInviteStatus from './enums/FriendInviteStatus';
import PrivateServerLinkStatus from './enums/PrivateServerLinkStatus';
import ProfileShareFriendshipSourceType from './enums/ProfileShareFriendshipSourceType';
import ProfileShareStatus from './enums/ProfileShareStatus';
import ScreenshotInviteStatus from './enums/ScreenshotInviteStatus';
import ExperienceDetailsStatus from './enums/ExperienceDetailsStatus';
import AvatarItemDetailsStatus from './enums/AvatarItemDetailsStatus';
import ExperienceAffiliateStatus from './enums/ExperienceAffiliateStatus';
import ContentPostStatus from './enums/ContentPostStatus';

enum ShareLinksType {
  AVATAR_ITEM_DETAILS = 'AvatarItemDetails',
  CONTENT_POST = 'ContentPost',
  EXPERIENCE_INVITE = 'ExperienceInvite',
  EXPERIENCE_AFFILIATE = 'ExperienceAffiliate',
  FRIEND_INVITE = 'FriendInvite',
  NOTIFICATION_EXPERIENCE_INVITE = 'NotificationExperienceInvite',
  PROFILE = 'Profile',
  SCREENSHOT_INVITE = 'ScreenshotInvite',
  SERVER = 'Server',
  EXPERIENCE_DETAILS = 'ExperienceDetails'
}

type ExperienceInviteData = {
  status: ExperienceInviteStatus;
  inviterId: number;
  placeId: number;
  instanceId: string;
  launchData?: string;
};

type FriendInviteData = {
  status: FriendInviteStatus;
  senderUserId: number;
  friendingToken: string;
};

type PrivateServerLinkData = {
  status: PrivateServerLinkStatus;
  ownerUserId: number;
  universeId: number;
  privateServerId: number;
  linkCode: string;
};

type ProfileData = {
  status: ProfileShareStatus;
  userId: number;
};

type ScreenshotInviteData = {
  status: ScreenshotInviteStatus;
  inviterId: number;
  placeId: number;
  instanceId: string;
  launchData: string;
};

type ExperienceDetailsData = {
  status: ExperienceDetailsStatus;
  universeId: number;
};

type AvatarItemDetailsData = {
  status: AvatarItemDetailsStatus;
  itemId: string;
  itemType: string;
};

type ExperienceAffiliateData = {
  status: ExperienceAffiliateStatus;
  universeId: number;
};

type ContentPostData = {
  status: ContentPostStatus;
  postId: number;
  postCreatorId: number;
};

export {
  AvatarItemDetailsData,
  ContentPostData,
  ExperienceInviteData,
  FriendInviteData,
  PrivateServerLinkData,
  ProfileData,
  ProfileShareFriendshipSourceType,
  ScreenshotInviteData,
  ExperienceDetailsData,
  ExperienceAffiliateData,
  ShareLinksType
};
