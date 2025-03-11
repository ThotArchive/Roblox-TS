import React from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { withTranslations } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { escapeHtml } from 'core-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';

const { resources } = itemPurchaseConstants;

export default function createPurchaseVerificationModal() {
  const [Modal, modalService] = createModal();
  function PurchaseVerificationModal({
    translate,
    title,
    expectedPrice,
    thumbnail,
    assetName,
    assetType,
    assetTypeDisplayName,
    sellerName,
    isPlace,
    onAction,
    loading,
    currentRobuxBalance
  }) {
    let defaultTitle;
    let actionButtonText;
    const assetInfo = {
      assetName: renderToString(<AssetName name={assetName} />),
      assetType: assetTypeDisplayName || assetType,
      seller: escapeHtml()(sellerName),
      robux: renderToString(<PriceLabel {...{ price: expectedPrice }} />)
    };
    let bodyMessageResource = isPlace
      ? resources.promptBuyAccessMessage
      : resources.promptBuyMessage;
    if (!isPlace && assetInfo.seller === '') {
      bodyMessageResource = resources.promptBuySimplifiedMessage;
    }

    if (expectedPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyNowAction);
    }

    if (isPlace) {
      actionButtonText = translate(resources.buyAccessAction);
    }

    const body = (
      <div
        className='modal-message'
        dangerouslySetInnerHTML={{
          __html: translate(bodyMessageResource, assetInfo)
        }}
      />
    );

    return (
      <Modal
        {...{
          title: title || defaultTitle,
          body,
          thumbnail,
          neutralButtonText: translate(resources.cancelAction),
          actionButtonText,
          onAction,
          footerText: (
            <BalanceAfterSaleText
              expectedPrice={expectedPrice}
              currentRobuxBalance={currentRobuxBalance}
            />
          ),
          loading
        }}
        actionButtonShow
      />
    );
  }

  PurchaseVerificationModal.defaultProps = {
    isPlace: false,
    assetTypeDisplayName: '',
    title: '',
    loading: false,
    currentRobuxBalance: undefined
  };

  PurchaseVerificationModal.propTypes = {
    translate: PropTypes.func.isRequired,
    title: PropTypes.string,
    expectedPrice: PropTypes.number.isRequired,
    thumbnail: PropTypes.node.isRequired,
    assetName: PropTypes.string.isRequired,
    assetType: PropTypes.string.isRequired,
    assetTypeDisplayName: PropTypes.string,
    sellerName: PropTypes.string.isRequired,
    isPlace: PropTypes.bool,
    onAction: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    currentRobuxBalance: PropTypes.number
  };
  return [
    withTranslations(PurchaseVerificationModal, translationConfig.purchasingResources),
    modalService
  ];
}
