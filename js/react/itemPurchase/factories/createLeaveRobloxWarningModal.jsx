import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';

const { resources } = itemPurchaseConstants;

export default function createLeaveRobloxWarningModal() {
  const [Modal, modalService] = createModal();
  function LeaveRobloxWarningModal({ translate, onContinueToPayment }) {
    const bodyContent =
      translate(resources.redirectToPartnerWebsiteMessage, { linebreak: '\n\n' }) ||
      'This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\n Proceed to partner website for payment?';
    const body = <p className='modal-body'>{bodyContent}</p>;
    return (
      <Modal
        {...{
          title: translate(resources.leavingRobloxHeading) || 'Leaving Roblox',
          body,
          neutralButtonText: translate(resources.cancelAction),
          actionButtonText: translate(resources.continueToPaymentAction) || 'Continue To Payment',
          onAction: () => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
              true,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG
            );
            onContinueToPayment();
          },
          onClose: () => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_ROBUX_UPSELL,
              true,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEAVE_ROBLOX_WARNING,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL
            );
          }
        }}
        actionButtonShow
      />
    );
  }
  LeaveRobloxWarningModal.defaultProps = {
    onContinueToPayment: null
  };
  LeaveRobloxWarningModal.propTypes = {
    translate: PropTypes.func.isRequired,
    onContinueToPayment: PropTypes.func
  };
  return [
    withTranslations(LeaveRobloxWarningModal, translationConfig.purchasingResources),
    modalService
  ];
}
