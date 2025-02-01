import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import { PromptType } from '../../../../../common/request/types/promptAssignments';
import { FooterButtonConfig, FragmentModalFooter } from '../../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../../common/modalHeader';
import { ModalFragmentProps } from '../../../constants/types';
import useAccountSecurityPromptContext from '../../../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../../../store/action';
import ModalState from '../../../store/modalState';
import { getDaysRemainingToForceReset } from '../../commonHelpers';

/**
 * The start of the change password modal flow.
 */
const ModalChangePasswordIntro: React.FC<ModalFragmentProps> = ({
  closeModal
}: ModalFragmentProps) => {
  const {
    state: { promptAssignment, resources, requestService },
    dispatch
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const continueToChangePassword = () => {
    setRequestError(null);
    setRequestInFlight(true);
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_FORM
    });
  };

  /*
   * Render Properties
   */

  let bodyText = 'An unexpected issue occurred while displaying this text.';
  if (!promptAssignment.isGeneric) {
    // IMPORTANT: Do not inject user input into this variable; this content is
    // rendered as HTML.
    bodyText =
      promptAssignment.promptType !== PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL
        ? `${resources.Description.UnusualActivity} ${resources.Description.ChangeYourPassword}`
        : // PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL
          `${
            resources.Description.ChangeYourPasswordImmediately
          } ${resources.Description.NoChangeForceReset(
            getDaysRemainingToForceReset(promptAssignment.metadata.forceResetTimestamp)
          )}`;
  }

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.ContinueChangePassword
    ),
    label: resources.Action.ContinueChangePassword,
    enabled: !requestInFlight,
    action: continueToChangePassword
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.ChangeYourPassword}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <Modal.Body>
        <div className='modal-lock-icon' />
        <p
          className='modal-margin-bottom'
          // We need to do this since the translated text injects tags. There
          // should be no vulnerability since we control the translated text.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: bodyText }}
        />
        <p className='text-error xsmall'>{requestError}</p>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalChangePasswordIntro;
