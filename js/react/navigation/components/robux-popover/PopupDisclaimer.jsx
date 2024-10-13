import React from 'react';
import { SimpleModal } from 'react-style-guide';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translationConfig } from '../../translation.config';

function PopupDisclaimer({ translate, isShopModalOpen, closeShopModal, onModalContinue }) {
  const modalBody = (
    <React.Fragment>
      <p className='shop-description'>{translate('Description.RetailWebsiteRedirect')}</p>
      <p className='shop-warning'>{translate('Description.PurchaseAgeWarning')}</p>
    </React.Fragment>
  );

  return (
    <SimpleModal
      title={translate('Heading.LeavingRoblox')}
      body={modalBody}
      show={isShopModalOpen}
      actionButtonShow
      actionButtonText={translate('Action.Continue')}
      neutralButtonText={translate('Action.Cancel')}
      onAction={onModalContinue}
      onNeutral={closeShopModal}
      onClose={closeShopModal}
    />
  );
}

PopupDisclaimer.propTypes = {
  translate: PropTypes.func.isRequired,
  isShopModalOpen: PropTypes.bool.isRequired,
  closeShopModal: PropTypes.func.isRequired,
  onModalContinue: PropTypes.func.isRequired
};

export default withTranslations(PopupDisclaimer, translationConfig);
