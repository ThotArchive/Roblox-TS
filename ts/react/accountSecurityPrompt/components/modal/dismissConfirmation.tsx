import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import * as PromptAssignments from '../../../../common/request/types/promptAssignments';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { LOG_PREFIX } from '../../app.config';
import { ModalFragmentProps } from '../../constants/types';
import useAccountSecurityPromptContext from '../../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../../store/action';
import ModalState from '../../store/modalState';

/**
 * The dismiss forever confirmation page of either flow (logic switched based
 * on flow type).
 */
const ModalDismissConfirmation: React.FC<ModalFragmentProps> = ({
  closeModal
}: ModalFragmentProps) => {
  const {
    state: { promptAssignment, resources, requestService },
    dispatch
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const dismissForever = async () => {
    setRequestInFlight(true);
    const result = await requestService.promptAssignments.updateForCurrentUser(
      PromptAssignments.UpdateAction.DISABLE_PROMPT,
      promptAssignment.promptType
    );
    if (result.isError) {
      setRequestInFlight(false);
      // eslint-disable-next-line no-console
      console.warn(
        LOG_PREFIX,
        'Disabling prompt failed with error',
        result.error && PromptAssignments.PromptAssignmentsError[result.error]
      );
      return;
    }
    dispatch({ type: AccountSecurityPromptActionType.DISMISS_FOREVER });
    closeModal();
  };

  const abortAction = () => {
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_INTRO
    });
  };

  /*
   * Render Properties
   */

  const bodyMessage = resources.Description.AreYouSureDismissForeverChangePassword;
  const confirmActionText = resources.Action.ConfirmDismissForeverChangePassword;
  const abortActionText = resources.Action.AbortDismissForeverChangePassword;

  const positiveButton: FooterButtonConfig = {
    content: abortActionText,
    label: abortActionText,
    enabled: !requestInFlight,
    action: abortAction
  };

  const negativeButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      confirmActionText
    ),
    label: confirmActionText,
    enabled: !requestInFlight,
    action: dismissForever
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.AreYouSure}
        buttonType={HeaderButtonType.HIDDEN}
        buttonAction={closeModal}
        buttonEnabled
        headerInfo={null}
      />
      <Modal.Body>
        <div className='modal-lock-icon' />
        <p>{bodyMessage}</p>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={negativeButton} />
    </React.Fragment>
  );
};

export default ModalDismissConfirmation;
