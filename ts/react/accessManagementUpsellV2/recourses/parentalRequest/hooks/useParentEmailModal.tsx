import React, { useMemo, useState } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { localStorageService } from 'core-roblox-utilities';
import parentalRequestConstants from '../constants/parentalRequestConstants';
import parentalRequestInlineErrorHandler, {
  ParentalRequestError
} from '../utils/parentalRequestErrorHandler';
import RequestType from '../enums/RequestType';
import parentalRequestService from '../services/parentalRequestService';
import {
  sendParentEmailSubmitEvent,
  sendInteractParentEmailFormEvent
} from '../services/eventService';
import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';

const useParentEmailModal = (
  translate: TranslateFunction,
  consentType: RequestType,
  successCallBack: (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => void,
  onHidecallback: () => void,
  value?: Record<string, unknown> | null
): [JSX.Element, IModalService] => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sendEmailBtnLoadingStatus, setSendEmailBtnLoadingStatus] = useState<boolean>(false);
  const [parentEmailInput, setParentEmailInput] = useState<string>('');
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const {
    privacyPolicyUrl,
    chargebackWizardSessionTokenLocalStorageKey,
    emailRegex,
    translationKeys
  } = parentalRequestConstants;

  const { gatherParentEmail } = translationKeys;
  const [errorTranslationKey, setErrorTranslationKey] = useState('');

  const regex = new RegExp(emailRegex);
  const getSetEmailErrorMessage = () => {
    if (parentEmailInput.length > 0 && !regex.test(parentEmailInput)) {
      return translate(gatherParentEmail.invalidEmailError);
    }

    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return '';
  };

  const sendParentEmailAddress = async () => {
    setErrorTranslationKey('');
    // needs to clear the local cache before starting a new wizard session
    localStorageService.removeLocalStorage(chargebackWizardSessionTokenLocalStorageKey);

    try {
      const response = await parentalRequestService.sendRequestToNewParent({
        email: parentEmailInput,
        requestType: consentType,
        requestDetails: value
      });
      sendParentEmailSubmitEvent(consentType, response.sessionId);
      setSendEmailBtnLoadingStatus(false);
      modalService.close();
      successCallBack(response.sessionId, parentEmailInput);
    } catch (err) {
      setParentEmailInput('');
      setSendEmailBtnLoadingStatus(false);
      const error = err as ParentalRequestError;
      const errorReason = parentalRequestInlineErrorHandler(
        error.data.code as ParentalRequestErrorReason
      );
      if (errorReason === ParentalRequestErrorReason.SenderFloodedRequestCreated) {
        successCallBack(error.data.sessionId, undefined, true);
      }
      setErrorTranslationKey(errorReason);
    }
  };
  const modalBody = (
    <React.Fragment>
      <div className='parental-consent-modal-body'>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(gatherParentEmail.body, { lineBreak: '<br /><br />' })
          }}
        />
      </div>
      <form className='form-horizontal' autoComplete='off'>
        <div id='parent-email-container' className='form-group'>
          <input
            id='parent-email-address'
            type='email'
            className='form-control input-field'
            placeholder={translate(gatherParentEmail.emailPlaceholder)}
            autoComplete='off'
            value={parentEmailInput}
            onChange={e => {
              setParentEmailInput(e.target.value);
              setErrorTranslationKey('');
            }}
            onFocus={() => sendInteractParentEmailFormEvent(consentType)}
          />
        </div>
        {/* <!-- Do not remove the two input hidden fields below. They are to prevent browsers from saving the email as your username in the autofill settings https://stackoverflow.com/questions/15738259/disabling-chrome-autofill --> */}
        <input type='text' className='hidden' name='fake-username' />
        <input
          type='password'
          className='hidden'
          name='fake-password'
          autoComplete='new-password'
        />
        {/* <!-- Do not remove the two input hidden fields above. --> */}
      </form>
      <div className='form-group'>
        <p className='text-error form-control-label'>{getSetEmailErrorMessage()}</p>
      </div>
      <div
        className='text-footer user-settings-modal-text-footer'
        dangerouslySetInnerHTML={{
          __html: translate(gatherParentEmail.footer, {
            linkStart: `<a class='text-link' rel='noreferrer' target='_blank' href='${privacyPolicyUrl}'>`,
            linkEnd: '</a>'
          })
        }}
      />
    </React.Fragment>
  );

  const emailModal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHidecallback();
      }}
      backdrop
      className='user-settings-modal'
      size='sm'
      aria-labelledby='user-settings-modal-title'
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='user-settings-modal-title-container'>
          <Modal.Title id='user-settings-modal-title'>
            {translate(gatherParentEmail.title)}
          </Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          onClick={() => {
            modalService.close();
            onHidecallback();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>{modalBody}</Modal.Body>
      <Modal.Footer>
        <Button
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          width={Button.widths.full}
          isDisabled={parentEmailInput === '' || getSetEmailErrorMessage() !== ''}
          isLoading={sendEmailBtnLoadingStatus}
          onClick={async () => {
            setSendEmailBtnLoadingStatus(true);
            await sendParentEmailAddress();
          }}>
          {translate(gatherParentEmail.btnText)}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [emailModal, modalService];
};

export default useParentEmailModal;
