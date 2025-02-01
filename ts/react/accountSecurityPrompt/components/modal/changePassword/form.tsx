import React, { Fragment, useState } from 'react';
import { Modal } from 'react-style-guide';
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
    state: { username, resources, requestService },
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
      if (passwordResult.error === Passwords.PasswordsError.INVALID_CURRENT_PASSWORD) {
        setRequestErrorForCurrentPassword(true);
      } else {
        setRequestErrorForCurrentPassword(false);
      }
      setRequestError(mapPasswordErrorToResource(resources, passwordResult.error));
      return;
    }

    // Transition: Password was successfully changed.
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_CONFIRMATION
    });
  };

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
        headerInfo={null}
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
