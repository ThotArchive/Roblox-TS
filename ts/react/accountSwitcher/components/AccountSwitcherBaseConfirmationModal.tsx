import React, { Fragment, useEffect } from 'react';
import { Modal } from 'react-style-guide';

import {
  sendAccountSwitcherConfirmationModalButtonClickEvent,
  sendShowAccountSwitcherConfirmationModalShownEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

export type AccountSwitcherBaseConfirmationModalProps = {
  origin: string;
  localizedTitleText: string;
  localizedBodyText: string;
  shouldShowXButton?: boolean;
  primaryButtonCallback?: () => void;
  localizedPrimaryButtonText?: string;
  secondaryButtonCallback?: () => void;
  localizedSecondaryButtonText?: string;
  onClose: () => void;
};

export const AccountSwitcherBaseConfirmationModal = ({
  origin, // todo refactor away from the name origin, which has a different meaning in logging historically
  localizedTitleText,
  localizedBodyText,
  shouldShowXButton = false,
  primaryButtonCallback,
  localizedPrimaryButtonText,
  secondaryButtonCallback,
  localizedSecondaryButtonText,
  onClose
}: AccountSwitcherBaseConfirmationModalProps): JSX.Element => {
  useEffect(() => {
    sendShowAccountSwitcherConfirmationModalShownEvent(origin);
  }, [origin]);

  const handlePrimaryButtonClick = () => {
    sendAccountSwitcherConfirmationModalButtonClickEvent(origin, EVENT_CONSTANTS.btn.primaryButton);
    if (primaryButtonCallback) {
      primaryButtonCallback();
    }
  };

  const handleSecondaryButtonClick = () => {
    sendAccountSwitcherConfirmationModalButtonClickEvent(
      origin,
      EVENT_CONSTANTS.btn.secondaryButton
    );
    if (secondaryButtonCallback) {
      secondaryButtonCallback();
    }
  };

  return (
    <Fragment>
      <Modal.Header
        className='logout-all-accounts-header'
        title={localizedTitleText}
        onClose={onClose}
        showCloseButton={shouldShowXButton}
      />
      <Modal.Body>
        <div className='base-confirmation-modal-body-container'>
          <div className='section-content modal-section'>
            <p className='body-text'>{localizedBodyText}</p>
            {localizedPrimaryButtonText && primaryButtonCallback && (
              <button
                type='button'
                id='account-switch-primary-button'
                className='btn-full-width account-switch-primary-button btn-primary-md modal-button'
                onClick={handlePrimaryButtonClick}>
                {localizedPrimaryButtonText}
              </button>
            )}
            {localizedSecondaryButtonText && secondaryButtonCallback && (
              <button
                type='button'
                id='account-switch-secondary-button'
                className='btn-full-width account-switch-secondary-button btn-secondary-md modal-button'
                onClick={handleSecondaryButtonClick}>
                {localizedSecondaryButtonText}
              </button>
            )}
          </div>
        </div>
      </Modal.Body>
    </Fragment>
  );
};
