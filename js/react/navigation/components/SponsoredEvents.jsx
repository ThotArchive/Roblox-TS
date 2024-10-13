import { eventStreamService } from 'core-roblox-utilities';
import React from 'react';
import PropTypes from 'prop-types';
import urlConstants from '../constants/urlConstants';

const { eventTypes } = eventStreamService;
const { getSponsoredEventUrl } = urlConstants;

const sponsoredEvent = {
  name: 'sponsoredEventClicked',
  type: eventTypes.pageLoad,
  context: 'click'
};

function sendSponsoredEventClick(sponsoredPageName) {
  if (eventStreamService) {
    eventStreamService.sendEvent(sponsoredEvent, { sponsoredPageName });
  }
}

function SponsoredEvent({ translate, sponsoredPagesData }) {
  const sponsoredPages = sponsoredPagesData.map(({ title, name, pageType, logoImageUrl }) => {
    if (logoImageUrl) {
      return (
        <li key={name} className='rbx-nav-sponsor' ng-non-bindable='true'>
          <a
            className='text-nav menu-item'
            href={getSponsoredEventUrl(pageType, name)}
            title={title}
            onClick={() => sendSponsoredEventClick(title)}>
            {logoImageUrl ? <img src={logoImageUrl} alt='' /> : <span>{title}</span>}
          </a>
        </li>
      );
    }
    return null;
  });

  const anySponsoredEventPages = sponsoredPages.some(page => page !== null);

  return (
    <React.Fragment>
      {anySponsoredEventPages && (
        <li className='font-bold small text-nav'> {translate('Label.sEvents')}</li>
      )}
      {sponsoredPages}
    </React.Fragment>
  );
}

SponsoredEvent.defaultProps = {
  sponsoredPagesData: []
};
SponsoredEvent.propTypes = {
  translate: PropTypes.func.isRequired,
  sponsoredPagesData: PropTypes.instanceOf(Array)
};

export default SponsoredEvent;
