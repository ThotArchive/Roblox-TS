import React, { Fragment, useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import * as AccountPin from '../../../../../common/request/types/accountPin';
import * as Passwords from '../../../../../common/request/types/passwords';
import InputControl, {
  validateChained,
  validateEquals,
  validatePassword,
  validateTrue
} from '../../../../common/inputControl';
import { FooterButtonConfig, FragmentModalFooter } from '../../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../../common/modalHeader';
import {
  CHANGE_PASSWORD_SUGGESTED_CHARACTER_COUNT,
  FORGOT_PASSWORD_SUPPORT_URL
} from '../../../app.config';
import { mapPasswordErrorToResource } from '../../../constants/resources';
import { ModalFragmentProps } from '../../../constants/types';
import useAccountSecurityPromptContext from '../../../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../../../store/action';
import ModalState from '../../../store/modalState';
import { returnToIntro } from '../../commonHandlers';

/**
 * The change password form.
 */
const ModalChangePasswordForm: React.FC<ModalFragmentProps> = () => {
  const {
    state: { username, resources, requestService, accountPinUnlockedUntil },
    dispatch
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestErrorForCurrentPassword, setRequestErrorForCurrentPassword] = useState(false);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [accountPinUnlockedForMinutes, setAccountPinUnlockedForMinutes] = useState(0);
  const [accountPinUnlockedForSeconds, setAccountPinUnlockedForSeconds] = useState(0);

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);
  const clearNewPasswordError = () => setNewPasswordError(null);
  const clearConfirmNewPasswordError = () => setConfirmNewPasswordError(null);
  /** Applies multiple void functions to an error value. */
  const applyToError = (...errorFunctions: ((error: string | null) => void)[]) => (
    error: string | null
  ) => {
    errorFunctions.forEach(errorFunction => errorFunction(error));
  };

  const changePassword = async () => {
    setRequestError(null);
    setRequestInFlight(true);
    const passwordResult = await requestService.password.changeForCurrentUser(
      currentPassword,
      newPassword
    );
    if (passwordResult.isError) {
      setRequestInFlight(false);
      // Transition: Account pin needs to be unlocked.
      if (passwordResult.error === Passwords.PasswordsError.PIN_LOCKED) {
        dispatch({
          type: AccountSecurityPromptActionType.SET_MODAL_STATE,
          modalState: ModalState.ACCOUNT_PIN_FORM_EXPIRED
        });
        return;
      }
      if (passwordResult.error === Passwords.PasswordsError.INVALID_CURRENT_PASSWORD) {
        setRequestErrorForCurrentPassword(true);
      } else {
        setRequestErrorForCurrentPassword(false);
      }
      setRequestError(mapPasswordErrorToResource(resources, passwordResult.error));
      return;
    }

    // Attempt to re-lock the user's account pin if it was unlocked.
    if (accountPinUnlockedUntil !== null) {
      const pinResult = await requestService.accountPin.lock();
      if (!pinResult.isError || pinResult.error === AccountPin.AccountPinError.ACCOUNT_LOCKED) {
        dispatch({
          type: AccountSecurityPromptActionType.SET_ACCOUNT_PIN_UNLOCKED_UNTIL,
          accountPinUnlockedUntil: null
        });
      }
    }

    // Transition: Password was successfully changed.
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_CONFIRMATION
    });
  };

  /*
   * Effects
   */

  // Countdown timer effect.
  useEffect(() => {
    let intervalId: number;
    const runCountdown = () => {
      if (accountPinUnlockedUntil === null) {
        clearInterval(intervalId);
        return;
      }

      if (Date.now() < accountPinUnlockedUntil) {
        // Pin not expired; update countdown timer.
        const accountPinUnlockedForSecondsTotal = (accountPinUnlockedUntil - Date.now()) / 1000;
        setAccountPinUnlockedForMinutes(Math.floor(accountPinUnlockedForSecondsTotal / 60));
        setAccountPinUnlockedForSeconds(Math.floor(accountPinUnlockedForSecondsTotal % 60));
      } else {
        // Transition: Pin expired; return to account pin form.
        dispatch({
          type: AccountSecurityPromptActionType.SET_MODAL_STATE,
          modalState: ModalState.ACCOUNT_PIN_FORM_EXPIRED
        });
      }
    };

    // Run once immediately.
    runCountdown();
    intervalId = setInterval(runCountdown, 1000);

    // Cleans up the interval when the component effects are cleaned up.
    return () => clearInterval(intervalId);
  }, [
    accountPinUnlockedUntil,
    setAccountPinUnlockedForMinutes,
    setAccountPinUnlockedForSeconds,
    dispatch
  ]);

  /*
   * Render Properties
   */

  const inputValid =
    currentPassword !== '' &&
    currentPasswordError === null &&
    newPassword !== '' &&
    newPasswordError === null &&
    confirmNewPassword !== '' &&
    confirmNewPasswordError === null;

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className='spinner spinner-xs spinner-no-margin' />
    ) : (
      resources.Action.SubmitChangePassword
    ),
    label: resources.Action.SubmitChangePassword,
    enabled: !requestInFlight && inputValid,
    action: changePassword
  };

  const currentPasswordBottomLabel = (
    <a
      href={FORGOT_PASSWORD_SUPPORT_URL}
      className='bottom-label-link'
      target='_blank'
      rel='noreferrer'>
      {resources.Label.IForgotMyPassword}
    </a>
  );

  const newPasswordBottomLabel = (
    <Fragment>
      <div className='shield-check-icon xsmall' />
      <div className='bottom-label-text-with-start-margin text-label xsmall'>
        {resources.Label.UseAUniquePassword}
      </div>
    </Fragment>
  );

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.CreateAStrongPassword}
        buttonType={HeaderButtonType.BACK}
        buttonAction={returnToIntro(dispatch)}
        buttonEnabled={!requestInFlight}
        headerInfo={
          accountPinUnlockedUntil !== null ? (
            <React.Fragment>
              <p className='small modal-modern-header-info-line'>{resources.Label.TimeRemaining}</p>
              <p
                className='small modal-modern-header-info-line'
                style={{ fontFamily: 'monospace, monospace' }}>
                {accountPinUnlockedForMinutes.toString().padStart(2, '0')}
                {
                  // eslint-disable-next-line react/jsx-no-literals
                }
                :{accountPinUnlockedForSeconds.toString().padStart(2, '0')}
              </p>
            </React.Fragment>
          ) : null
        }
      />
      <Modal.Body>
        <InputControl
          id='inputCurrentPassword'
          label={resources.Label.CurrentPassword}
          bottomLabel={currentPasswordBottomLabel}
          inputType='password'
          autoComplete='current-password'
          placeholder=''
          disabled={requestInFlight}
          value={currentPassword}
          setValue={setCurrentPassword}
          error={currentPasswordError || (requestErrorForCurrentPassword && requestError) || null}
          setError={setCurrentPasswordError}
          validate={validateTrue}
          canSubmit={inputValid}
          handleSubmit={changePassword}
          onChange={clearRequestError}
        />
        <InputControl
          id='inputNewPassword'
          label={resources.Label.NewPassword}
          bottomLabel={newPasswordBottomLabel}
          inputType='password'
          autoComplete='new-password'
          placeholder={resources.Label.AtLeastCharacters(CHANGE_PASSWORD_SUGGESTED_CHARACTER_COUNT)}
          disabled={requestInFlight}
          value={newPassword}
          setValue={setNewPassword}
          error={newPasswordError}
          setError={applyToError(clearConfirmNewPasswordError, setNewPasswordError)}
          validate={validateChained(
            validatePassword(
              requestService,
              resources,
              username,
              resources.Message.Error.PasswordValidation.Default
            ),
            confirmNewPassword !== ''
              ? validateEquals(
                  resources.Message.Error.Input.PasswordsDoNotMatch,
                  confirmNewPassword
                )
              : validateTrue
          )}
          canSubmit={inputValid}
          handleSubmit={changePassword}
          onChange={clearRequestError}
        />
        <InputControl
          id='inputNewPasswordAgain'
          label={resources.Label.ConfirmNewPassword}
          inputType='password'
          autoComplete='new-password'
          placeholder=''
          disabled={requestInFlight}
          value={confirmNewPassword}
          setValue={setConfirmNewPassword}
          error={
            confirmNewPasswordError || (!requestErrorForCurrentPassword && requestError) || null
          }
          setError={applyToError(clearNewPasswordError, setConfirmNewPasswordError)}
          validate={validateChained(
            validateEquals(resources.Message.Error.Input.PasswordsDoNotMatch, newPassword),
            validatePassword(
              requestService,
              resources,
              username,
              resources.Message.Error.PasswordValidation.Default
            )
          )}
          canSubmit={inputValid}
          handleSubmit={changePassword}
          onChange={clearRequestError}
        />
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalChangePasswordForm;
