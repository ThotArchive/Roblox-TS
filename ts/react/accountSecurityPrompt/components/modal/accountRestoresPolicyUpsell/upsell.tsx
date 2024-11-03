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
 * The start of the account restore policy upsell modal flow.
 */
const ModalAccountRestoresPolicyUpsell: React.FC<ModalFragmentProps> = ({
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

  /*
   * Event Handlers
   */

  const dismissTemporary = async () => {
    // Once the user decides to continue to authenticator setup we dismiss the prompt.
    // If the user actually sets it up they won't get it again at all.
    const result = await requestService.promptAssignments.updateForCurrentUser(
      PromptAssignments.UpdateAction.DISMISS_PROMPT,
      promptAssignment.promptType
    );
    if (result.isError) {
      // eslint-disable-next-line no-console
      console.warn(
        LOG_PREFIX,
        'Dismissing Account Restores Policy Upsell prompt failed with error',
        result.error && PromptAssignments.PromptAssignmentsError[result.error]
      );
    }
  };

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
      resources.Action.SetUpAuthenticatorAccountRestoresPolicyUpsell
    ),
    label: resources.Action.SetUpAuthenticatorAccountRestoresPolicyUpsell,
    enabled: !requestInFlight,
    action: continueToAuthenticatorSetup
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.AccountRestoresPolicyUpsell}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModalAndDismissTemporary}
        buttonEnabled
        headerInfo={null}
      />
      <Modal.Body>
        <div className='modal-lock-icon' />

        <p
          className='modal-margin-bottom-sm'
          // We need to do this since the translated text injects tags. There
          // should be no vulnerability since we control the translated text.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: resources.Description.AccountRestoresPolicyUpsellMessageBody(
              ACCOUNT_SETTINGS_SECURITY_PATH
            )
          }}
        />
        <p className='text-error xsmall'>{requestError}</p>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalAccountRestoresPolicyUpsell;
