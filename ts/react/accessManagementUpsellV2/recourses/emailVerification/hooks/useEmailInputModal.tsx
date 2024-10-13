import React, { useMemo, useState } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { useAppDispatch } from '../../../store';
import emailRequestConstants from '../constants/emailRequestConstants';
import emailVerificationEventService from '../services/emailVerificationEventService';
import { updateUserEmail, resetEmailVerificationStore } from '../emailVerificationSlice';

const useEmailInputModal = (
  translate: TranslateFunction,
  onHide: () => void
): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sendEmailBtnLoadingStatus, setSendEmailBtnLoadingStatus] = useState<boolean>(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [userEmailInput, setUserEmailInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const emailModalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => {
        dispatch(resetEmailVerificationStore());
        setModalOpen(false);
      }
    }),
    []
  );

  const { emailRegex, translationKeys } = emailRequestConstants;
  const { addEmailToAccountKeys } = translationKeys;
  const [errorTranslationKey, setErrorTranslationKey] = useState('');

  const regex = new RegExp(emailRegex);
  const getEmailErrorMessage = () => {
    if (!regex.test(userEmailInput)) {
      return translate(addEmailToAccountKeys.MessageInvalidEmailAddress);
    }

    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return '';
  };

  const exitAMPUpsell = () => {
    dispatch(resetEmailVerificationStore());
    setModalOpen(false);
    onHide();
  };

  const addEmailToAccount = () => {
    setErrorTranslationKey('');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(updateUserEmail(userEmailInput));
  };

  const updateUserEmailInput = (inputValue: string) => {
    setUserEmailInput(inputValue);
    setErrorTranslationKey('');

    const errorMessage = getEmailErrorMessage();
    setErrorMsg(errorMessage);
    setDisableSubmit(
      sendEmailBtnLoadingStatus || inputValue.length <= 0 || errorMessage.length > 0
    );
  };

  const modalBody = (
    <React.Fragment>
      <div className='email-upsell-image' />
      <p className='email-upsell-text-body'>
        {translate(addEmailToAccountKeys.DescriptionAddEmailTextOver13, {
          emailAddress: userEmailInput
        })}
      </p>
      <input
        type='email'
        className={`${
          errorMsg ? 'input-field-error' : ''
        } form-control input-field email-upsell-modal-input`}
        placeholder={translate(addEmailToAccountKeys.LabelEmailInputPlaceholderOver13)}
        value={userEmailInput}
        onFocus={() => emailVerificationEventService.useAddEmailToAccountEvent('')}
        onChange={e => updateUserEmailInput(e.target.value)}
      />
      {errorMsg && <p className='text-error modal-error-message'>{translate(errorMsg)}</p>}
    </React.Fragment>
  );

  const emailModal = (
    <Modal
      show={modalOpen}
      onHide={exitAMPUpsell}
      backdrop
      className='mail-upsell-android-modal'
      size='sm'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={exitAMPUpsell}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate(addEmailToAccountKeys.HeadingAddEmail)}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>{modalBody}</Modal.Body>
      <Modal.Footer>
        <Button
          className='modal-button email-upsell-btn'
          variant={Button.variants.cta}
          size={Button.sizes.medium}
          isDisabled={disableSubmit}
          onClick={() => {
            addEmailToAccount();
          }}>
          {translate(addEmailToAccountKeys.btnText)}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [emailModal, emailModalService];
};

export default useEmailInputModal;
