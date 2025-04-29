import React from 'react';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';

const SUPPORT_URL = 'https://www.roblox.com/info/2sv';

/**
 * A component that displays a Roblox support URL.
 */
const SupportHelp: React.FC<{ className?: string }> = ({ className }) => {
  const {
    state: { resources }
  } = useTwoStepVerificationContext();

  // IMPORTANT: Do not inject user input into this variable; this content is
  // rendered as HTML.
  const supportLink = resources.Label.NeedHelpContactSupport(
    `<a class="text-name text-footer contact" href="${SUPPORT_URL}" target="_blank" rel="noopener noreferrer">${resources.Label.RobloxSupport}</a>`
  );

  return (
    <p
      className={`text-footer${className ? ` ${className}` : ''}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: supportLink }}
    />
  );
};
export default SupportHelp;
