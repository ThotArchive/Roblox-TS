import React, { useMemo, useState, useEffect } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { localStorageService } from 'core-roblox-utilities';
import parentalRequestConstants from '../constants/parentalRequestConstants';
import parentalRequestInlineErrorHandler, {
  ParentalRequestError
} from '../utils/parentalRequestErrorHandler';
import RequestType from '../enums/RequestType';
import ExpNewChildModal from '../../../enums/ExpNewChildModal';
import parentalRequestService from '../services/parentalRequestService';
import {
  sendParentEmailSubmitEvent,
  sendInteractParentEmailFormEvent
} from '../services/eventService';
import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';
import fetchFeatureCheckResponse from '../../../accessManagement/accessManagementAPI';
import AmpResponse from '../../../accessManagement/AmpResponse';
import { Access } from '../../../enums';
import { PrologueConstants } from '../../../accessManagement/constants/viewConstants';

const useParentEmailModal = (
  translate: TranslateFunction,
  consentType: RequestType,
  successCallBack: (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => void,
  onHidecallback: () => void,
  value?: Record<string, unknown> | null,
  expChildModalType?: ExpNewChildModal
): [JSX.Element, IModalService] => {
  const {
    privacyPolicyUrl,
    chargebackWizardSessionTokenLocalStorageKey,
    emailRegex,
    translationKeys
  } = parentalRequestConstants;
  const { gatherParentEmail } = translationKeys;
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isChildSubjectToPC, setIsChildSubjectToPC] = useState<boolean>(false);
  const [sendEmailBtnLoadingStatus, setSendEmailBtnLoadingStatus] = useState<boolean>(false);
  const [parentEmailInput, setParentEmailInput] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>(translate(gatherParentEmail.title));
  const [description, setDescription] = useState<JSX.Element>(
    <span
      dangerouslySetInnerHTML={{
        __html: translate(gatherParentEmail.body, { lineBreak: '<br /><br />' })
      }}
    />
  );
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const [errorTranslationKey, setErrorTranslationKey] = useState('');
  const settingName = useMemo(() => {
    if (consentType === RequestType.UpdateUserSetting) {
      return Object.keys(value)[0];
    }
    return undefined;
  }, [consentType, value]);

  const fetchIsChildSubjectToPC = async () => {
    try {
      const response = (await fetchFeatureCheckResponse(
        parentalRequestConstants.isChildSubjectToPCFeatureName
      )) as AmpResponse;
      setIsChildSubjectToPC(response.access === Access.Granted);
    } catch (error) {
      // Handle error if needed
    }
  };
  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchIsChildSubjectToPC();
  }, []);
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
      sendParentEmailSubmitEvent({
        requestType: consentType,
        sessionId: response.sessionId,
        details: value
      });
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

  useEffect(() => {
    const descriptionTranslationKey = isChildSubjectToPC
      ? gatherParentEmail.body
      : gatherParentEmail.bodyWithoutPC;
    const expBodyTranslationKey = isChildSubjectToPC
      ? gatherParentEmail.combinedBody
      : gatherParentEmail.combinedBodyWithoutPC;
    if (settingName === parentalRequestConstants.settingName.enablePurchases) {
      switch (expChildModalType) {
        case ExpNewChildModal.askYourParentTitle:
          setModalTitle(translate(gatherParentEmail.askYourParentTitle));
          setDescription(
            <span>
              <span>{translate(PrologueConstants.Description.VpcEnablePurchase)}</span>
              <br />
              <br />
              <span>{translate(expBodyTranslationKey)}</span>
            </span>
          );
          break;
        case ExpNewChildModal.permissionNeededTitle:
          setModalTitle(translate(gatherParentEmail.permissionNeededTitle));
          setDescription(
            <span>
              <span>{translate(PrologueConstants.Description.VpcEnablePurchase)}</span>
              <br />
              <br />
              <span>{translate(expBodyTranslationKey)}</span>
            </span>
          );
          break;
        case ExpNewChildModal.visualized:
          setModalTitle(translate(gatherParentEmail.askYourParentTitle));
          setDescription(
            <div>
              <div className='parent-email-image' />
              <span>{translate(PrologueConstants.Description.VpcEnablePurchase)}</span>
              <br />
              <br />
              <span>{translate(expBodyTranslationKey)}</span>
            </div>
          );
          break;
        default:
          setDescription(
            <span
              dangerouslySetInnerHTML={{
                __html: translate(descriptionTranslationKey, { lineBreak: '<br /><br />' })
              }}
            />
          );
      }
    }
  }, [expChildModalType, isChildSubjectToPC, settingName]);

  const modalBody = (
    <React.Fragment>
      <div className='parental-consent-modal-body'>{description}</div>
      <form className='form-horizontal' autoComplete='off'>
        <div id='parent-email-container' className='form-group'>
          <label htmlFor='parent-email-address' className='form-control-label'>
            {translate(gatherParentEmail.parentEmailLabel)}
          </label>
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
            onFocus={() =>
              sendInteractParentEmailFormEvent({
                requestType: consentType,
                details: value
              })
            }
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
        className='text-footer access-management-upsell-inner-modal-text-footer'
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
      className='access-management-upsell-inner-modal'
      size='sm'
      aria-labelledby='access-management-upsell-inner-modal-title'
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='access-management-upsell-inner-modal-title-container'>
          <Modal.Title id='access-management-upsell-inner-modal-title'>{modalTitle}</Modal.Title>
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
