import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';
import {
  UpsellCardContent,
  UpsellCardTitle,
  UpsellCardImageClass,
  UpsellCardEventSection,
  UpsellCardButtonOrientations,
  getUpsellCardButtonGroup
} from '../constants/upsellCardConstants';
import { sendEvent } from '../services/accountInfoService';
import { events } from '../constants/upsellCardEventStreamConstants';

function HomePageUpsellCard({
  translate,
  cardType,
  origin,
  titleTextOverride,
  bodyTextOverride,
  requireExplicitVoiceConsent
}) {
  const [upsellHidden, setUpsellHidden] = useState(false);
  const eventLogSection = UpsellCardEventSection[cardType];

  useEffect(() => {
    sendEvent(events.cardShown, origin, cardType, eventLogSection);
  }, []);

  const buttonGroup = getUpsellCardButtonGroup(cardType, requireExplicitVoiceConsent);
  const primaryButtonConfig = buttonGroup?.primaryButton;

  const primaryButton = !primaryButtonConfig ? null : (
    <Button
      className='btn-primary-md'
      id='upsell-card-primary-button'
      onClick={() => {
        sendEvent(
          events.buttonClick,
          origin,
          cardType,
          eventLogSection,
          primaryButtonConfig.buttonClickBtnLog
        );
        primaryButtonConfig.onClick(shouldHide => {
          setUpsellHidden(shouldHide);
        });
      }}>
      {translate(primaryButtonConfig.text)}
    </Button>
  );

  const secondaryButtonConfig = buttonGroup?.secondaryButton;
  const secondaryButton = !secondaryButtonConfig ? null : (
    <Button
      className='btn-secondary-md'
      id='upsell-card-secondary-button'
      onClick={() => {
        sendEvent(
          events.buttonClick,
          origin,
          cardType,
          eventLogSection,
          secondaryButtonConfig.buttonClickBtnLog
        );
        secondaryButtonConfig.onClick(shouldHide => {
          setUpsellHidden(shouldHide);
        });
      }}>
      {translate(secondaryButtonConfig.text)}
    </Button>
  );

  const orientation =
    buttonGroup?.buttonStackOrientation ?? UpsellCardButtonOrientations.horizontal;

  const btnGroup = (
    <div
      className={
        orientation === UpsellCardButtonOrientations.horizontal
          ? 'upsell-card-horizontal-button-list'
          : 'upsell-card-vertical-button-list'
      }>
      {primaryButton}
      {secondaryButton}
    </div>
  );
  const titleText = !isEmpty(titleTextOverride)
    ? titleTextOverride
    : translate(UpsellCardTitle[cardType]);
  const bodyText = !isEmpty(bodyTextOverride)
    ? bodyTextOverride
    : translate(UpsellCardContent[cardType]);

  const textContentGroup = (
    <div className='upsell-card-text-content-group'>
      {!UpsellCardTitle[cardType] ? null : <div className='font-header-1'> {titleText}</div>}
      <div className='upsell-card-content'> {bodyText}</div>
    </div>
  );

  const iconComponent = UpsellCardImageClass[cardType] ? (
    <div className={`home-page-upsell-card-image ${UpsellCardImageClass[cardType]}`} />
  ) : null;

  return upsellHidden ? null : (
    <div className='home-page-upsell-card-banner-container'>
      <div className='banner-contents'>
        <div className='icon-and-text'>
          {iconComponent}
          <div className='banner-content-container'>{textContentGroup}</div>
        </div>
        <div className='add-email-btn-container'>{btnGroup}</div>
        <div id='facebookSunsetModal-container' />
      </div>
    </div>
  );
}

function isEmpty(str) {
  return !str || str.length === 0;
}

HomePageUpsellCard.defaultProps = {
  origin: 'homepage',
  titleTextOverride: '',
  bodyTextOverride: '',
  requireExplicitVoiceConsent: true
};

HomePageUpsellCard.propTypes = {
  translate: PropTypes.func.isRequired,
  cardType: PropTypes.string.isRequired,
  titleTextOverride: PropTypes.string,
  bodyTextOverride: PropTypes.string,
  origin: PropTypes.string,
  requireExplicitVoiceConsent: PropTypes.bool
};

export default HomePageUpsellCard;
