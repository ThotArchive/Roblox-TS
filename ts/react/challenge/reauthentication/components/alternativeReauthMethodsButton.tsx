import React from 'react';
import { useHistory } from 'react-router';
import { reauthenticationTypeToPath } from '../hooks/useActiveReauthenticationType';
import useReauthenticationContext from '../hooks/useReauthenticationContext';

type Props = {
  requestInFlight: boolean;
  setRequestError: (requestError: string | null) => void;
};

/**
 * A component that displays a small text button to show alternate reauth methods.
 * Implemented by making a state change.
 */
const AlternativeReauthMethodsButton: React.FC<Props> = ({ requestInFlight, setRequestError }) => {
  const {
    state: { resources, renderInline }
  } = useReauthenticationContext();

  const history = useHistory();
  const clearReauthenticationType = () => {
    // Clear previous errors and set the current page to empty so the
    // reauthentication type list gets routed to.
    setRequestError(null);
    history.push(reauthenticationTypeToPath(null));
  };

  const buttonLinkClassName = renderInline
    ? 'inline-challenge-body-button-link'
    : 'modal-body-button-link';

  return (
    <p>
      <button
        type='button'
        className={`${buttonLinkClassName} small`}
        onClick={() => clearReauthenticationType()}
        disabled={requestInFlight}>
        {resources.Action.ChangeVerificationMethod}
      </button>
    </p>
  );
};
export default AlternativeReauthMethodsButton;
