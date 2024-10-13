import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { renderToString } from 'react-dom/server';
import { createModal } from 'react-style-guide';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';

const { resources } = itemPurchaseConstants;

export default function createPriceChangedModal() {
  const [Modal, modalService] = createModal();
  function PriceChangedModal({ translate, expectedPrice, currentPrice, onAction, loading }) {
    const [checked, setChecked] = useState(false);
    const body = (
      <React.Fragment>
        <div
          className='modal-message'
          dangerouslySetInnerHTML={{
            __html: translate(resources.priceChangedMessage, {
              robuxBefore: renderToString(
                <PriceLabel {...{ price: expectedPrice, color: 'gray' }} />
              ),
              robuxAfter: renderToString(<PriceLabel {...{ price: currentPrice, color: 'gray' }} />)
            })
          }}
        />
        <div className='modal-checkbox checkbox'>
          <input
            id='modal-checkbox-input'
            name='agreementCheckBox'
            type='checkbox'
            checked={checked}
          />
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events */}
          <label onClick={() => setChecked(!checked)} htmlFor='modal-checkbox-input'>
            {translate(resources.agreeAndPayLabel)}
          </label>
        </div>
      </React.Fragment>
    );

    return (
      <Modal
        {...{
          title: translate(resources.priceChangedHeading),
          body,
          neutralButtonText: translate(resources.cancelAction),
          actionButtonText: translate(resources.buyRobuxAction),
          onAction,
          loading,
          disableActionButton: !checked,
          footerText: <BalanceAfterSaleText expectedPrice={currentPrice} />
        }}
        actionButtonShow
      />
    );
  }

  PriceChangedModal.defaultProps = {
    loading: false
  };
  PriceChangedModal.propTypes = {
    translate: PropTypes.func.isRequired,
    expectedPrice: PropTypes.number.isRequired,
    currentPrice: PropTypes.number.isRequired,
    onAction: PropTypes.func.isRequired,
    loading: PropTypes.bool
  };
  return [withTranslations(PriceChangedModal, translationConfig.purchasingResources), modalService];
}
