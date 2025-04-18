import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { HomePageUpsellCardService, UpsellService } from 'Roblox';
import HomePageUpsellCard from '../components/HomePageUpsellCard';
import { UpsellCardType } from '../constants/upsellCardConstants';
import {
  contactMethodPromptOrigins,
  contactMethodPromptSections
} from '../constants/upsellCardEventStreamConstants';
import isCardTypeSupported from '../utils/upsellCardUtils';

function HomePageUpsellCardContainer({ translate }) {
  const { ContactMethodMandatoryEmailPhone } = UpsellCardType;
  const [upsellCardContext, setUpsellCardContext] = useState(null);
  const [titleTextOverride, setTitleTextOverride] = useState('');
  const [bodyTextOverride, setBodyTextOverride] = useState('');
  const [requireExplicitVoiceConsent, setRequireExplicitVoiceConsent] = useState(false);
  const [ageEstimationModalVisible, setAgeEstimationModalVisible] = useState(false);

  useEffect(() => {
    const updateUpsellCardContext = async () => {
      try {
        const context = await HomePageUpsellCardService.getHomePageUpsellCardVariation();
        const upsellCardType = context?.upsellCardType;
        if (upsellCardType) {
          setUpsellCardContext(context?.upsellCardType);
          setTitleTextOverride(context?.localizedTitleTextOverride);
          setBodyTextOverride(context?.localizedBodyTextOverride);
        }
      } catch (error) {
        console.error(`Error getting the upsell card variation ${error}`);
        setUpsellCardContext(null);
      }
    };

    const updateRequireExplicitVoiceConsent = async () => {
      try {
        const voicePolicy = await HomePageUpsellCardService.getVoicePolicy();
        if (voicePolicy?.requireExplicitVoiceConsent != null) {
          setRequireExplicitVoiceConsent(voicePolicy?.requireExplicitVoiceConsent);
        }
      } catch (error) {
        console.error(`Error reading policy for homepage upsellcard ${error}`);
        // Fail compliantly if we can't reach GUAC
        setRequireExplicitVoiceConsent(true);
      }
    };

    updateUpsellCardContext();
    updateRequireExplicitVoiceConsent();
  }, []);

  useEffect(() => {
    if (upsellCardContext === ContactMethodMandatoryEmailPhone) {
      UpsellService?.renderContactMethodPromptModal({
        origin: contactMethodPromptOrigins.homepage,
        section: contactMethodPromptSections.mandatory
      });
    }
  }, [upsellCardContext]);

  if (isCardTypeSupported(upsellCardContext)) {
    return (
      <HomePageUpsellCard
        translate={translate}
        cardType={upsellCardContext}
        titleTextOverride={titleTextOverride}
        bodyTextOverride={bodyTextOverride}
        requireExplicitVoiceConsent={requireExplicitVoiceConsent}
      />
    );
  }
  return null;
}

HomePageUpsellCardContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default HomePageUpsellCardContainer;
