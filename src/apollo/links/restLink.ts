import { RestLink } from 'apollo-link-rest';
import urlConstants from '../../constants/urlConstants';
import UserProfileDetails from '../../types/UserProfileDetails';

const responseTransformer = async (response: Response): Promise<UserProfileDetails[]> => {
  return ((await response.json()) as { profileDetails: UserProfileDetails[] }).profileDetails;
};

const restLink = new RestLink({
  uri: urlConstants.userProfileApiUrl,
  credentials: 'include',
  responseTransformer
});

export default restLink;
