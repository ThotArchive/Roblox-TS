import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import * as PromptAssignments from '../../../../../common/request/types/promptAssignments';
import { FooterButtonConfig, FragmentModalFooter } from '../../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../../common/modalHeader';
import {
  ACCOUNT_SETTINGS_SECURITY_PATH,
  AUTH_REDIRECT_URL_SIGNIFIER,
  LOG_PREFIX
} from '../../../app.config';
import { ModalFragmentProps } from '../../../constants/types';
import useAccountSecurityPromptContext from '../../../hooks/useAccountSecurityPromptContext';

/**
 * The modal to encourage users to download authenticator apps and push
 * them to Account Settings.
 */
const ModalAuthenticatorUpsellDownload: React.FC<ModalFragmentProps> = ({
  closeModal
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, promptAssignment }
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  const dismissTemporary = async () => {
    // Once the user decides to continue to authenticator setup we dismiss the prompt
    // for a week. If the user actually sets it up they won't get it again at all.
    const result = await requestService.promptAssignments.updateForCurrentUser(
      PromptAssignments.UpdateAction.DISMISS_PROMPT,
      promptAssignment.promptType
    );
    if (result.isError) {
      // eslint-disable-next-line no-console
      console.warn(
        LOG_PREFIX,
        'Dismissing Authenticator Upsell prompt failed with error',
        result.error && PromptAssignments.PromptAssignmentsError[result.error]
      );
    }
  };

  /*
   * Event Handlers
   */

  const closeModalAndDismissTemporary = async () => {
    closeModal();
    await dismissTemporary();
  };

  const continueToAuthenticatorSetup = async () => {
    setRequestError(null);
    setRequestInFlight(true);

    await dismissTemporary();

    // The `_self` target opens the redirect URL in the current page.
    window.open(ACCOUNT_SETTINGS_SECURITY_PATH + AUTH_REDIRECT_URL_SIGNIFIER, '_self');
  };

  /*
   * Render Properties
   */

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.AuthenticatorUpsellNextButtonMessage
    ),
    label: resources.Action.AuthenticatorUpsellNextButtonMessage,
    enabled: !requestInFlight,
    action: continueToAuthenticatorSetup
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.AuthenticatorUpsellDownloadAuthenticator}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModalAndDismissTemporary}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <Modal.Body>
        <div>
          <p>{resources.Label.AuthenticatorUpsellDownloadInstruction}</p>
        </div>
        <div className='authenticator-upsell-download-grid'>
          <div className='grid-container'>
            <div className='grid-item'>
              <div className='modal-checkmark-icon' />
            </div>
            <div className='grid-item'>
              <div>{resources.Label.AuthenticatorUpsellMicrosoftOption}</div>
            </div>
            <div className='grid-item'>
              <div className='modal-checkmark-icon' />
            </div>
            <div className='grid-item'>
              <div>{resources.Label.AuthenticatorUpsellGoogleOption}</div>
            </div>
            <div className='grid-item'>
              <div className='modal-checkmark-icon' />
            </div>
            <div className='grid-item'>
              <div>{resources.Label.AuthenticatorUpsellTwilioOption}</div>
            </div>
          </div>
        </div>
        <p className='text-error xsmall'>{requestError}</p>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalAuthenticatorUpsellDownload;
