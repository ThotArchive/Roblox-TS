import React, { ReactNode, useState } from 'react';
import { Modal } from 'react-style-guide';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import InputControl, { validateTrue } from '../../../common/inputControl';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import ForgotYourPasswordLink from '../components/forgotYourPasswordLink';
import { mapReauthenticationErrorToResource } from '../constants/resources';
import useReauthenticationContext from '../hooks/useReauthenticationContext';
import { ReauthenticationActionType } from '../store/action';

type Props = {
  requestInFlightState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  requestErrorState: [string | null, React.Dispatch<React.SetStateAction<string | null>>];
  children: ReactNode;
};

/**
 * A component to handle passwords for Reauthentication.
 */

const PasswordInput: React.FC<Props> = ({ requestInFlightState, requestErrorState, children }) => {
  const {
    state: { renderInline, resources, requestService, metricsService, eventService },
    dispatch
  } = useReauthenticationContext();

  /*
   * Component State
   */

  const [password, setPassword] = useState<string>('');
  const [requestInFlight, setRequestInFlight] = requestInFlightState;
  const [requestError, setRequestError] = requestErrorState;

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);
  const verifyPassword = async () => {
    // Check password and generate token if correct.
    setRequestInFlight(true);
    const result = await requestService.reauthentication.generateToken({ password });

    // Request failures on this endpoint are considered transient (the requests
    // can be tried again, potentially after changing the password).
    if (result.isError) {
      setRequestError(
        `${mapReauthenticationErrorToResource(resources, result.error)} ${
          resources.Action.PleaseTryAgain
        }`
      );
      setRequestInFlight(false);
      return;
    }

    // Handle request success (token generated).
    setRequestError(null);
    dispatch({
      type: ReauthenticationActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        reauthenticationToken: result.value.token
      }
    });
  };

  /*
   * Render Properties
   */

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.Verify
    ),
    label: resources.Action.Verify,
    enabled: !requestInFlight && password.length > 0,
    action: verifyPassword
  };

  /*
   * Component Markup
   */
  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomXLargeClassName = renderInline
    ? 'inline-challenge-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';

  return (
    <React.Fragment>
      <BodyElement>
        <div className={lockIconClassName} />
        <p className={marginBottomXLargeClassName}>{resources.Description.EnterYourPassword}</p>

        <InputControl
          id='reauthentication-password-input'
          inputType='password'
          disabled={requestInFlight}
          value={password}
          setValue={setPassword}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          canSubmit={password.length > 0}
          handleSubmit={verifyPassword}
          onChange={clearRequestError}
          // Optional parameters:
          autoComplete='off'
          placeholder={resources.Label.YourPassword}
          hideFeedback
        />

        <p>
          <ForgotYourPasswordLink />
          {children}
        </p>
      </BodyElement>
      <FooterElement positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default PasswordInput;
