import React from 'react';
import { EventStream } from 'Roblox';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Link } from 'react-style-guide';
import { urlService } from 'core-utilities';
import { linksList, linksListWithGiftCardLabel } from '../constants/footerConstants';
import CookieConsentLink from './CookieConsentLink';

function sendRobuxFooterEvent(className, event) {
  if (EventStream) {
    EventStream.SendEventWithTarget(
      'PageFooter',
      'click',
      {
        destination: `${className}`,
        source: `${event.currentTarget.ownerDocument.location.pathname}`
      },
      EventStream.TargetTypes.WWW
    );
  }
}

function FooterLinks({ translate, intl }) {
  let linksPointer = linksList;

  let isEnabled = false;
  const element = document.getElementById('footer-container');
  if (element != null) {
    const giftCardsValue = element.getAttribute('data-is-giftcards-footer-enabled');
    if (giftCardsValue != null) {
      isEnabled = giftCardsValue.toLowerCase() === 'true';
    }
  }

  if (isEnabled) {
    linksPointer = linksListWithGiftCardLabel;
  }

  const links = linksPointer.map(link => {
    const classNames = ClassNames('text-footer-nav', link.cssClass);

    return (
      <li key={link.name} className='footer-link'>
        <Link
          url={urlService.getUrlWithLocale(link.path, intl.getRobloxLocale())}
          cssClasses={classNames}
          target='_blank'
          onClick={e => sendRobuxFooterEvent(link.name, e)}>
          {translate(link.labelTranslationKey)}
          {link.postfixIcon ? (
            <img src={link.postfixIcon} alt='' className='footer-postfixIcon' />
          ) : (
            ''
          )}
        </Link>
      </li>
    );
  });

  return (
    <ul className='row footer-links'>
      {links}
      <li>
        <CookieConsentLink translate={translate} />
      </li>
    </ul>
  );
}

FooterLinks.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired
};

export default FooterLinks;
