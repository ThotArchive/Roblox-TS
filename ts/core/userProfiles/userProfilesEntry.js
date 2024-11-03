import {
  apolloClient,
  writeQuery,
  useUserProfiles,
  UserProfileField,
  userProfilesModule,
  userProfilesService
} from '@rbx/user-profile-api-client';

window.RobloxUserProfiles = {
  apolloClient,
  writeQuery,
  useUserProfiles,
  UserProfileField,
  userProfilesModule,
  userProfilesService
};
