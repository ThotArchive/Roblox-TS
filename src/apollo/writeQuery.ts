import { type UserProfileFieldEnum } from '../constants/UserProfileField';
import apolloClient from './apolloClient';
import buildQuery from './buildQuery';
import persistentCacheService from './cache/persistentCacheService';
import typenames from '../constants/typenames';
import type UserProfileNames from '../types/UserProfileNames';

function writeQuery(
  userId: number,
  fields: UserProfileFieldEnum[],
  data: { names: UserProfileNames; isVerified?: boolean; isDeleted?: boolean }
) {
  const cacheObjectsToInvalidate = persistentCacheService.getAllCachedProfilesByUserId(userId);

  cacheObjectsToInvalidate.forEach(([userIds, cachedProfiles]) => {
    apolloClient.writeQuery({
      query: buildQuery(fields),
      variables: {
        userIds,
        bodyBuilder: () => ({ userIds, fields })
      },
      data: {
        userProfiles: cachedProfiles.map(profile => {
          if (profile.userId === userId) {
            return { ...profile, names: data.names, isVerified: data.isVerified, isDeleted: data.isDeleted };
          }

          return profile;
        })
      }
    });
  });

  apolloClient.writeQuery({
    query: buildQuery(fields),
    variables: {
      userIds: [userId],
      bodyBuilder: () => ({ userIds: [userId], fields })
    },
    data: {
      userProfiles: [
        {
          names: data.names,
          isVerified: data.isVerified,
          isDeleted: data.isDeleted,
          userId,
          __typename: typenames.UserProfiles
        }
      ]
    }
  });
}

export default writeQuery;
