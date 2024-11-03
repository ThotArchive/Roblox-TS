import { useQuery, ErrorPolicy } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import apolloClient from '../apollo/apolloClient';
import buildQuery from '../apollo/buildQuery';
import { type UserProfileFieldEnum } from '../constants/UserProfileField';
import UserProfileDetails from '../types/UserProfileDetails';
import UseUserProfiles from '../types/UseUserProfiles';
import formatUserProfileDetailsByUserId from '../apollo/formatUserProfileDetailsByUserId';

const useUserProfiles: UseUserProfiles = (
  userIds: number[],
  fields: UserProfileFieldEnum[],
  config?: { errorPolicy?: ErrorPolicy }
) => {
  const query = useMemo(() => buildQuery(fields), [fields]);
  const buildRequestBody = useCallback(() => ({ userIds, fields }), [userIds, fields]);

  const { loading, error, data } = useQuery<{ userProfiles: UserProfileDetails[] }>(query, {
    variables: {
      userIds,
      bodyBuilder: buildRequestBody
    },
    errorPolicy: config?.errorPolicy,
    client: apolloClient,
    skip: userIds.length === 0 || fields.length === 0
  });

  const formattedData = useMemo(() => {
    if (data) {
      return formatUserProfileDetailsByUserId(data.userProfiles);
    }
    return null;
  }, [data]);

  return {
    loading,
    error,
    data: formattedData,
    client: apolloClient
  };
};

export default useUserProfiles;
