import React from 'react';
import { SimpleModal } from 'react-style-guide';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translationConfig } from '../../translation.config';

function LeaveRobloxPopupDisclaimer({ translate, isOpen, onClose, onContinue }) {
  const modalBody = (
    <React.Fragment>
      <p className='modal-body'>
        {translate('Description.RedirectToPartnerWebsite') ||
          'This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\nProceed to partner website for payment?'}
      </p>
    </React.Fragment>
  );

  return (
    <SimpleModal
      title={translate('Heading.LeaveRoblox') || 'Leaving Roblox'}
      body={modalBody}
      show={isOpen}
      actionButtonShow
      actionButtonText={translate('Action.ContinueToPayment') || 'Continue to Payment'}
      neutralButtonText={translate('Action.Cancel') || 'Cancel'}
      onAction={onContinue}
      onNeutral={onClose}
      onClose={onClose}
    />
  );
}

LeaveRobloxPopupDisclaimer.propTypes = {
  translate: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired
};

export default withTranslations(LeaveRobloxPopupDisclaimer, translationConfig);
