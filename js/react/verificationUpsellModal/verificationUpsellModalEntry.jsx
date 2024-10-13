import { ready } from 'core-utilities';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Roblox from 'Roblox';
import App from './App';
import PhoneUpsellApp from './PhoneUpsellApp';
import {
  emailRootElementId,
  phoneRootElementId,
  contactMethodPromptRootElementId
} from './app.config';
import '../../../css/verificationUpsellModal/verificationUpsellModal.scss';
import {
  handleUserEmailUpsellAtLogout,
  handleUserEmailUpsellAtBuyRobux,
  handleUserEmailUpsellOnHomePage,
  handleUserEmailVerificationRequiredByPurchaseWarning,
  handleUserEmailUpsellAtPremiumSubscription,
  handleUserEmailVerificationRequiredByBan
} from './emailUpsellModal/services/emailServices';
import ContactMethodPromptApp from './ContactMethodPromptApp';

const renderPhoneUpsell = ({
  onClose,
  origin,
  existingPhoneNumber,
  addPhoneAlwaysShowLegalText,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess
} = {}) => {
  ready(() => {
    // using phoneRootElement is a bridge solution before refactoring the email
    // upsell logic.
    const element = document.getElementById(phoneRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      render(
        <PhoneUpsellApp
          onClose={onClose}
          origin={origin}
          existingPhoneNumber={existingPhoneNumber}
          addPhoneAlwaysShowLegalText={addPhoneAlwaysShowLegalText}
          addPhoneRequireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
          addPhoneHeadingKey={addPhoneHeadingKey}
          addPhoneDescriptionKey={addPhoneDescriptionKey}
          addPhoneLegalTextKey={addPhoneLegalTextKey}
          addPhoneButtonKey={addPhoneButtonKey}
          beforeSuccess={beforeSuccess}
        />,
        element
      );
    }
  });
};

const renderEmailUpsell = onClose => {
  ready(() => {
    const element = document.getElementById(emailRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      render(<App />, element);
      handleUserEmailUpsellOnHomePage(onClose);
    }
  });
};
const renderContactMethodPromptModal = ({ origin, section }) => {
  ready(() => {
    const element = document.getElementById(contactMethodPromptRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      render(<ContactMethodPromptApp origin={origin} section={section} />, element);
    }
  });
};

Roblox.UpsellService = {
  renderEmailUpsell,
  renderPhoneUpsell,
  renderContactMethodPromptModal
};

// Expose service to external apps
Roblox.EmailVerificationService = {
  handleUserEmailUpsellAtLogout,
  handleUserEmailUpsellAtBuyRobux,
  handleUserEmailUpsellOnHomePage,
  handleUserEmailVerificationRequiredByPurchaseWarning,
  handleUserEmailUpsellAtPremiumSubscription,
  handleUserEmailVerificationRequiredByBan
};

// TODO: non-hompeage upsells like logout and pre-purchase upsells depend on
// this render call.
// To be cleaned up - https://jira.rbx.com/browse/AA-351
ready(() => {
  if (document.getElementById(emailRootElementId)) {
    render(<App />, document.getElementById(emailRootElementId));
  }
});
