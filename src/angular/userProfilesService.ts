import { ApolloQueryResult, ErrorPolicy } from '@apollo/client';
import { Injectable } from 'angular';
import userProfilesModule from './userProfilesModule';
import apolloClient from '../apollo/apolloClient';
import buildQuery from '../apollo/buildQuery';
import formatUserProfileDetailsByUserId from '../apollo/formatUserProfileDetailsByUserId';
import { type UserProfileFieldEnum } from '../constants/UserProfileField';
import UserProfileDetails from '../types/UserProfileDetails';
import UserProfilesService from '../types/UserProfilesService';

const userProfilesService: Injectable<UserProfilesService> = () => {
  'ngInject';

  return {
    watchUserProfiles(userIds: number[], fields: UserProfileFieldEnum[], config?: { errorPolicy?: ErrorPolicy }) {
      const shouldSkip = !userIds || !fields || userIds.length === 0 || fields.length === 0;

      return apolloClient
        .watchQuery({
          query: buildQuery(fields),
          errorPolicy: config?.errorPolicy,
          fetchPolicy: shouldSkip ? 'cache-only' : 'cache-first',
          variables: {
            userIds,
            bodyBuilder: () => ({ userIds, fields })
          }
        })
        .map((response: ApolloQueryResult<{ userProfiles: UserProfileDetails[] }>) => ({
          ...response,
          data: formatUserProfileDetailsByUserId(response.data.userProfiles)
        }));
    },
    async queryUserProfiles(userIds: number[], fields: UserProfileFieldEnum[], config?: { errorPolicy?: ErrorPolicy }) {
      const shouldSkip = !userIds || !fields || userIds.length === 0 || fields.length === 0;

      const response = await apolloClient.query({
        query: buildQuery(fields),
        errorPolicy: config?.errorPolicy,
        fetchPolicy: shouldSkip ? 'cache-only' : 'cache-first',
        variables: {
          userIds,
          bodyBuilder: () => ({ userIds, fields })
        }
      });

      return formatUserProfileDetailsByUserId(response.data.userProfiles);
    }
  };
};

userProfilesModule.factory('userProfilesService', userProfilesService);

export default userProfilesService;
