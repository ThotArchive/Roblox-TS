import { ready } from 'core-utilities';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Roblox from 'Roblox';
import '../../../css/verificationUpsellModal/verificationUpsellModal.scss';
import AgeEstimationPromptApp from './AgeEstimationPromptApp';
import App from './App';
import {
  ageEstimationPromptRootElementId,
  contactMethodPromptRootElementId,
  emailRootElementId,
  phoneRootElementId
} from './app.config';
import ContactMethodPromptApp from './ContactMethodPromptApp';
import {
  handleUserEmailUpsellAtBuyRobux,
  handleUserEmailUpsellAtLogout,
  handleUserEmailUpsellAtPremiumSubscription,
  handleUserEmailUpsellOnHomePage,
  handleUserEmailVerificationRequiredByBan,
  handleUserEmailVerificationRequiredByPurchaseWarning
} from './emailUpsellModal/services/emailServices';
import PhoneUpsellApp from './PhoneUpsellApp';

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
  beforeSuccess,
  containerId,
  renderInWebview
} = {}) => {
  ready(() => {
    // using phoneRootElement is a bridge solution before refactoring the email
    // upsell logic.
    const element = document.getElementById(containerId ?? phoneRootElementId);
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
          renderInWebview={renderInWebview}
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

const renderAgeEstimationPromptModal = () => {
  ready(() => {
    const element = document.getElementById(ageEstimationPromptRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      render(<AgeEstimationPromptApp />, element);
    }
  });
};

Roblox.UpsellService = {
  renderEmailUpsell,
  renderPhoneUpsell,
  renderContactMethodPromptModal,
  renderAgeEstimationPromptModal
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
