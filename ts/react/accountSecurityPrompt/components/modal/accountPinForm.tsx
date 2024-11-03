import React, { useState } from 'react';
import { Modal } from 'react-style-guide';
import InputControl, { validateTrue } from '../../../common/inputControl';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { mapAccountPinErrorToResource } from '../../constants/resources';
import { ModalFragmentProps } from '../../constants/types';
import useAccountSecurityPromptContext from '../../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../../store/action';
import ModalState from '../../store/modalState';
import { returnToIntro } from '../commonHandlers';

/**
 * The account pin form.
 */
const ModalAccountPinForm: React.FC<ModalFragmentProps> = () => {
  const {
    state: { resources, requestService, modalState },
    dispatch
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [accountPin, setAccountPin] = useState('');
  const [accountPinError, setAccountPinError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);

  const unlockAccountPin = async () => {
    setRequestError(null);
    setRequestInFlight(true);
    const result = await requestService.accountPin.unlock(accountPin);
    // TODO: There is a potential edge case here if someone removes their
    // account pin while viewing this screen. This is very unlikely so we will
    // not handle it for readability.
    if (result.isError) {
      setRequestInFlight(false);
      setRequestError(mapAccountPinErrorToResource(resources, result.error));
      return;
    }

    // Transition: Set the time the pin is unlocked for, then show the change
    // password page.
    dispatch({
      type: AccountSecurityPromptActionType.SET_ACCOUNT_PIN_UNLOCKED_UNTIL,
      accountPinUnlockedUntil: Date.now() + result.value.unlockedUntil * 1000
    });
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_FORM
    });
  };

  /*
   * Render Properties
   */

  const inputValid = accountPinError === null && accountPin !== '';

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.UnlockAccountPin
    ),
    label: resources.Action.UnlockAccountPin,
    enabled: !requestInFlight && inputValid,
    action: unlockAccountPin
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={
          modalState === ModalState.ACCOUNT_PIN_FORM_EXPIRED
            ? resources.Header.AccountPinExpired
            : resources.Header.AccountPinRequired
        }
        buttonType={HeaderButtonType.BACK}
        buttonAction={returnToIntro(dispatch)}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <Modal.Body>
        <div className='modal-lock-icon' />
        <p className='modal-margin-bottom-xlarge'>{resources.Description.EnterYourAccountPin}</p>
        <InputControl
          id='inputAccountPin'
          label={resources.Label.AccountPin}
          inputType='password'
          autoComplete='off'
          placeholder=''
          disabled={requestInFlight}
          value={accountPin}
          setValue={setAccountPin}
          error={accountPinError || requestError}
          setError={setAccountPinError}
          validate={validateTrue}
          canSubmit={inputValid}
          handleSubmit={unlockAccountPin}
          onChange={clearRequestError}
        />
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalAccountPinForm;
