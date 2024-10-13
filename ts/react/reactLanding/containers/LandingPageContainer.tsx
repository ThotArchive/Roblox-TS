import React, { useState, useEffect } from 'react';
import { authenticatedUser } from 'header-scripts';
import { createModal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { dataStores } from 'core-roblox-utilities';
import { landingTranslationConfig } from '../translation.config';
import ActionBar from '../components/ActionBar';
import SignupHeader from '../components/SignupHeader';
import SignupFormContainer from './SignupFormContainer';
import CountryRatingLogos from '../components/CountryRatingLogos';
import AppStoreContainer from '../../appStoreLinks/components/AppStoreContainer';
import { getContentRatingLogoPolicy } from '../services/landingService';
import { sendAppClickEvent } from '../services/eventService';
import { urlConstants, landingPageStrings, experimentLayer } from '../constants/landingConstants';
import { isVerifiedParentConsentSignup } from '../utils/signupUtils';
import useExperiments from '../../common/hooks/useExperiments';
import {
  accountSwitcherConfirmationModalContainer,
  otpModalConstants
} from '../constants/signupConstants';

export const LandingPageContainer = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [shouldDisplayBrazilRatingLogo, setShouldDisplayBrazilRatingLogo] = useState(false);
  const [shouldDisplayItalyRatingLogo, setShouldDisplayItalyRatingLogo] = useState(false);
  const [ContentRatingModal, modalService] = createModal();
  const isEligibleForUsernameSuggestionExperiment = useExperiments(experimentLayer)
    .IsUsernameSuggestionEnabled as boolean;

  const isVPCSignup = isVerifiedParentConsentSignup();
  const shouldShowActionBar = !(isVPCSignup || authenticatedUser.isAuthenticated);

  const handleContentRatingModalAction = (): void => {
    let ratingGuideUrl = '';
    if (shouldDisplayBrazilRatingLogo) {
      ratingGuideUrl = urlConstants.brazilContentRatingGuide;
    } else if (shouldDisplayItalyRatingLogo) {
      ratingGuideUrl = urlConstants.italyContentRatingGuide;
    }
    window.open(ratingGuideUrl, '_blank');
  };

  const handleContentRatingLogoPolicy = async () => {
    const contentRatingLogoPolicy = await getContentRatingLogoPolicy();
    if (contentRatingLogoPolicy) {
      setShouldDisplayBrazilRatingLogo(contentRatingLogoPolicy.displayBrazilRatingLogo);
      setShouldDisplayItalyRatingLogo(contentRatingLogoPolicy.displayItalyRatingLogo);
    }
  };

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromReturnUrl }
      } = dataStores;
      saveGameIntentFromReturnUrl();
    } catch (e) {
      console.error('intent saving error: ', e);
    }
    // eslint-disable-next-line no-void
    void handleContentRatingLogoPolicy();
  }, []);

  return (
    <div id='landing-page-container dark-theme'>
      <section
        className={`row full-height-section rollercoaster-background ${
          isEligibleForUsernameSuggestionExperiment ? 'fixed-background' : ''
        }`}
        id='RollerContainer'>
        <div className='col-md-12 inner-full-height-section' id='InnerRollerContainer'>
          {shouldShowActionBar && <ActionBar />}
          <div
            className={`${
              shouldDisplayBrazilRatingLogo || shouldDisplayItalyRatingLogo
                ? 'lower-logo-container-with-content-rating-logo'
                : ''
            } lower-logo-container`}>
            <div id='signup-container'>
              <SignupHeader />
              <SignupFormContainer
                isEligibleForUsernameSuggestionExperiment={
                  isEligibleForUsernameSuggestionExperiment
                }
                translate={translate}
              />
              <CountryRatingLogos
                shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
                shouldDisplayItalyRatingLogo={shouldDisplayItalyRatingLogo}
                onContentRatingLogoClick={() => modalService.open()}
                translate={translate}
              />
              {(shouldDisplayBrazilRatingLogo || shouldDisplayItalyRatingLogo) && (
                <ContentRatingModal
                  title={translate(landingPageStrings.leavingRoblox)}
                  body={<p>{translate(landingPageStrings.externalWebsiteRedirect)}</p>}
                  actionButtonShow
                  actionButtonText={translate(landingPageStrings.continue)}
                  neutralButtonText={translate(landingPageStrings.cancel)}
                  onNeutral={() => modalService.close()}
                  onAction={handleContentRatingModalAction}
                />
              )}
            </div>
            {!isVPCSignup && (
              <AppStoreContainer onAppClick={sendAppClickEvent} translate={translate} />
            )}
            <div id='otp-container' />
          </div>
        </div>
      </section>
      <div id={otpModalConstants.otpSignupContainer} />
      <div id={accountSwitcherConfirmationModalContainer} />
    </div>
  );
};

export default withTranslations(LandingPageContainer, landingTranslationConfig);
