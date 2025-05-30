import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';
import { Cookies } from 'Roblox';
import cookieConsentConstants from '../constants/cookieConsentConstants';
import cookieBannerServices from '../services/cookieBannerServices';

function CookieConsentLink({ translate }) {
  const [nonEssentialCookieList, updateNonEssentialCookieList] = useState([]);
  const [essentialCookieList, updateEssentialCookieList] = useState([]);

  useEffect(() => {
    const updateCookiePolicy = async () => {
      const cookiePolicy = await cookieBannerServices.getCookiePolicy();
      if (cookiePolicy.ShouldDisplayCookieBannerV3 && cookiePolicy.NonEssentialCookieList) {
        updateNonEssentialCookieList(cookiePolicy.NonEssentialCookieList);
        updateEssentialCookieList(cookiePolicy.EssentialCookieList);
      }
    };
    updateCookiePolicy();
  }, []);
  const [consentTool, consentToolService] = Cookies.useConsentTool({
    nonEssentialCookieList,
    essentialCookieList,
    translate
  });
  if (essentialCookieList.length > 0) {
    return (
      <div>
        <Button
          onClick={consentToolService.open}
          className='btn text-footer-nav cookie-consent-link'
          variant={null}
          size={null}
          width={null}>
          {translate(cookieConsentConstants.consentLinkText)}
        </Button>
        {consentTool}
      </div>
    );
  }
  return null;
}

CookieConsentLink.propTypes = { translate: PropTypes.func.isRequired };
export default CookieConsentLink;
