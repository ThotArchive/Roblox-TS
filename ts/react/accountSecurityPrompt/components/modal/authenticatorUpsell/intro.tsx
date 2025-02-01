import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import * as PromptAssignments from '../../../../../common/request/types/promptAssignments';
import { FooterButtonConfig, FragmentModalFooter } from '../../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../../common/modalHeader';
import { LOG_PREFIX } from '../../../app.config';
import { ModalFragmentProps } from '../../../constants/types';
import useAccountSecurityPromptContext from '../../../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../../../store/action';
import ModalState from '../../../store/modalState';

/**
 * The start of the authenticator upsell modal flow.
 */
const ModalAuthenticatorUpsellIntro: React.FC<ModalFragmentProps> = ({
  closeModal
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, promptAssignment },
    dispatch
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

  const continueToDownloadAuthApp = () => {
    setRequestError(null);
    setRequestInFlight(true);

    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.AUTHENTICATOR_UPSELL_DOWNLOAD_APPS
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
      resources.Action.AuthenticatorUpsellSetupAuthenticatorButtonMessage
    ),
    label: resources.Action.AuthenticatorUpsellSetupAuthenticatorButtonMessage,
    enabled: !requestInFlight,
    action: continueToDownloadAuthApp
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.AuthenticatorUpsellWelcomeMessage}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModalAndDismissTemporary}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <Modal.Body>
        <div className='authenticator-upsell-intro-grid'>
          <div className='grid-container'>
            <div className='grid-item'>
              <div className='modal-two-factors-icon' />
            </div>
            <div className='grid-item'>
              <b>{resources.Label.AuthenticatorUpsellTwoFactorHeadline}</b>
              <div>{resources.Label.AuthenticatorUpsellTwoFactorMessage}</div>
            </div>
            <div className='grid-item'>
              <div className='modal-protect-icon' />
            </div>
            <div className='grid-item'>
              <b>{resources.Label.AuthenticatorUpsellProtectRobuxHeadline}</b>
              <div>{resources.Label.AuthenticatorUpsellProtectRobuxMessage}</div>
            </div>
            <div className='grid-item'>
              <div className='modal-keep-bad-icon' />
            </div>
            <div className='grid-item'>
              <b>{resources.Label.AuthenticatorUpsellBadActorHeadline}</b>
              <div>{resources.Label.AuthenticatorUpsellBadActorMessage}</div>
            </div>
          </div>
        </div>
        <p className='text-error xsmall'>{requestError}</p>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalAuthenticatorUpsellIntro;
