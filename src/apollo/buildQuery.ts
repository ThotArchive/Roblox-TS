import { DocumentNode, gql } from '@apollo/client';
import UserProfileField, { type UserProfileFieldEnum } from '../constants/UserProfileField';

const buildQuery = (fields: UserProfileFieldEnum[]): DocumentNode => {
  const fieldsSet = new Set(fields);
  return gql`
    query UserProfiles($userIds: [String]!, $bodyBuilder: any) {
      userProfiles(userIds: $userIds)
        @rest(type: "UserProfiles", path: "", method: "POST", bodyBuilder: $bodyBuilder) {
        userId
        names {
          ${fieldsSet.has(UserProfileField.Names.CombinedName) ? 'combinedName' : ''}
          ${fieldsSet.has(UserProfileField.Names.Username) ? 'username' : ''}
          ${fieldsSet.has(UserProfileField.Names.Alias) ? 'alias' : ''}
          ${fieldsSet.has(UserProfileField.Names.DisplayName) ? 'displayName' : ''}
          ${fieldsSet.has(UserProfileField.Names.ContactName) ? 'contactName' : ''}
          ${fieldsSet.has(UserProfileField.Names.PlatformName) ? 'platformName' : ''}
        }
         ${fieldsSet.has(UserProfileField.Names.IsVerified) ? 'isVerified' : ''}
         ${fieldsSet.has(UserProfileField.Names.IsVerified) ? 'isDeleted' : ''}
      }
    }
  `;
};

export default buildQuery;
