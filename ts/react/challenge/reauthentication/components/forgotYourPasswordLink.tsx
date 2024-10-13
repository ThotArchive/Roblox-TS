import React from 'react';
import { FORGOT_PASSWORD_SUPPORT_URL } from '../app.config';
import useReauthenticationContext from '../hooks/useReauthenticationContext';

/**
 * A component that displays a Roblox support URL for users that have forgotten
 * their password.
 */
const ForgotYourPasswordLink: React.FC = () => {
  const {
    state: { resources }
  } = useReauthenticationContext();

  // IMPORTANT: Do not inject user input into this variable; this content is
  // rendered as HTML.
  const supportLink = resources.Action.ForgotYourPassword(
    `<a class="text-name text-footer" href="${FORGOT_PASSWORD_SUPPORT_URL}" target="_blank">`,
    '</a>'
  );

  // eslint-disable-next-line react/no-danger
  return <span dangerouslySetInnerHTML={{ __html: supportLink }} />;
};
export default ForgotYourPasswordLink;
