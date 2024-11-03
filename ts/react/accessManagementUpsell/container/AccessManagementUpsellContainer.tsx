import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { Endpoints } from 'Roblox';
import accessManagementUpsellConstants from '../constants/accessManagementUpsellConstants';
import { ModalEvent } from '../constants/viewConstants';
import trackerClient from '../utils/loggingUtils';
import {
  AccountSettingsClickEvent,
  ShowModalEvent
} from '../constants/accessManagementUpsellEventStreamConstants';

function AccessManagementUpsellContainer({
  translate
}: {
  translate: TranslateFunction;
}): React.ReactElement {
  const {
    TitleText,
    BodyText,
    AccountInfoButtonText,
    accountSettingsPath
  } = accessManagementUpsellConstants;

  const [isModalOpen, setModalOpen] = useState(false);

  function handleModalDismiss() {
    setModalOpen(false);
  }

  function handlePrimaryAction() {
    // send to account settings page
    const url = Endpoints.getAbsoluteUrl(accountSettingsPath);
    if (typeof window !== 'undefined') {
      window.location.href = url;
      setModalOpen(false);

      trackerClient.sendEvent(AccountSettingsClickEvent);
    }
  }

  useEffect(() => {
    window.addEventListener(
      ModalEvent.OpenAccessManagementVerificationModal,
      () => {
        setModalOpen(true);

        trackerClient.sendEvent(ShowModalEvent);
      },
      false
    );
  }, []);

  return (
    <React.Fragment>
      <Modal
        show={isModalOpen}
        onHide={() => handleModalDismiss()}
        size='sm'
        aria-labelledby='access-management-modal-title'
        className='access-management-upsell-modal'
        scrollable='true'
        centered='true'>
        <Modal.Header useBaseBootstrapComponent>
          <button
            type='button'
            className='close'
            id='access-management-upsell-close-button'
            onClick={() => handleModalDismiss()}>
            <span className='icon-close' />
          </button>
          <Modal.Title id='access-management-modal-title'>{translate(TitleText)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{translate(BodyText)}</Modal.Body>
        <Modal.Footer>
          <Button
            variant={Button.variants.primary}
            width='full'
            onClick={() => handlePrimaryAction()}
            className='modal-button'>
            {translate(AccountInfoButtonText)}
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

AccessManagementUpsellContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default AccessManagementUpsellContainer;
