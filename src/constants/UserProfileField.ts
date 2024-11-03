import UserProfileNameField from './UserProfileNameFieldEnum';

const UserProfileField = {
  Names: UserProfileNameField,
  IsVerified: 'isVerified',
  IsDeleted: 'isDeleted'
};

export type UserProfileFieldEnum = UserProfileNameField;

export default UserProfileField;
