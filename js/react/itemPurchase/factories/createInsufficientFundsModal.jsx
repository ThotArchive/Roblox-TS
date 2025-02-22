import React from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { withTranslations } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import urlConstants from '../constants/urlConstants';
import PriceLabel from '../components/PriceLabel';

const { resources } = itemPurchaseConstants;

export default function createInsufficientFundsModal() {
  const [Modal, modalService] = createModal();
  function InsufficientFundsModal({ translate, robuxNeeded, source, onAccept }) {
    let body = (
      <div
        className='modal-message'
        dangerouslySetInnerHTML={{
          __html: translate(resources.insufficientFundsMessage, {
            robux: renderToString(<PriceLabel {...{ price: robuxNeeded }} />)
          })
        }}
      />
    );
    if (!robuxNeeded) {
      body = <div> {translate(resources.additionalRobuxNeeded)}</div>;
    }
    return (
      <Modal
        {...{
          title: translate(resources.insufficientFundsHeading),
          body,
          thumbnail: <span className='money-stack-icon' />,
          neutralButtonText: translate(resources.cancelAction),
          actionButtonText: translate(resources.buyRobuxAction),
          onAction: () => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
              true,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
            );
            if (onAccept) {
              onAccept();
            } else {
              window.location = urlConstants.getRobuxUpgradesUrl(source);
            }
            return false;
          },
          onClose: () => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
              true,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
            );
          }
        }}
        actionButtonShow
      />
    );
  }
  InsufficientFundsModal.defaultProps = {
    onAccept: null,
    source: ''
  };
  InsufficientFundsModal.propTypes = {
    translate: PropTypes.func.isRequired,
    source: PropTypes.string,
    onAccept: PropTypes.func,
    robuxNeeded: PropTypes.number.isRequired
  };
  return [
    withTranslations(InsufficientFundsModal, translationConfig.purchasingResources),
    modalService
  ];
}
