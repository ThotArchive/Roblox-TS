import { DisplayNames } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { concatTexts } from 'core-utilities';

const { name, displayName } = authenticatedUser;
const getNameForDisplay = () => {
  return DisplayNames?.Enabled() ? displayName : name;
};

const getUserNameForHeader = () => {
  return DisplayNames?.Enabled() ? concatTexts.concat(['', name]) : name;
};

export default {
  nameForDisplay: getNameForDisplay(),
  nameForHeader: getUserNameForHeader()
};
