import React, { useMemo, useState, useEffect } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { LegallySensitiveContentService } from 'Roblox';
import settingTranslationConstants from '../constants/settingTranslationConstants';
import { TCreateSettingsModal } from '../../../types/AmpTypes';
import { booleanToSettingValue } from '../utils/settingUtils';
import { ConsentFormInnerComponents } from '../components/ConsentFormInnerComponents';
import ConsentFormType from '../enums/ConsentFormType';
import UserSetting from '../../../../legallySensitiveContent/enums/UserSetting';

const useUpdateSettingsModal: TCreateSettingsModal = (
  translate,
  {
    settingName,
    title,
    body,
    actionButtonText,
    neutralButtonText,
    onAction,
    onHide,
    onNeutral,
    consentFormType
  }
) => {
  const [
    legallySensitiveContent,
    legallySensitiveActions
  ] = LegallySensitiveContentService.useLegallySensitiveContentAndActions(
    settingName as UserSetting
  );

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (consentFormType === ConsentFormType.Notice) {
      setIsChecked(true);
    }
  }, [consentFormType]);

  const getConsentForm = (): JSX.Element => {
    const ConsentFormInnerComponent =
      ConsentFormInnerComponents[consentFormType as ConsentFormType];
    if (!ConsentFormInnerComponent) return <React.Fragment />;

    return (
      <div className='consent-form small text'>
        <ConsentFormInnerComponent
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          wordsOfConsent={legallySensitiveContent.wordsOfConsent}
        />
      </div>
    );
  };

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHide();
      }}
      backdrop
      className='access-management-upsell-inner-modal user-settings-modal'
      size='md'
      aria-labelledby='user-settings-modal-title'
      scrollable
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='user-settings-modal-title-container'>
          <Modal.Title id='user-settings-modal-title'>{title}</Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          title={translate(settingTranslationConstants.close)}
          onClick={() => {
            modalService.close();
            onHide();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>
        {body}
        {getConsentForm()}
      </Modal.Body>
      <Modal.Footer>
        <Button
          className='modal-half-width-button'
          variant={Button.variants.control}
          size={Button.sizes.medium}
          onClick={() => {
            modalService.close();
            onNeutral?.();
            onHide();
          }}>
          {neutralButtonText}
        </Button>
        <Button
          className='modal-half-width-button modal-primary-button'
          variant={Button.variants.control}
          size={Button.sizes.medium}
          isDisabled={!isChecked}
          onClick={() => {
            modalService.close();
            legallySensitiveActions.updateSettingWithAuditing(
              settingName as UserSetting,
              booleanToSettingValue(isChecked, settingName as UserSetting)
            );
            onAction?.();
            onHide();
          }}>
          {actionButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [modal, modalService];
};

export default useUpdateSettingsModal;
