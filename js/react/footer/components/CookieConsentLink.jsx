import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';
import cookieUtils from '../utils/cookieUtils';
import cookieConsentConstants from '../constants/cookieConsentConstants';
import cookieBannerServices from '../services/cookieBannerServices';
import ConsentTool from '../../../../../../Roblox.CookieBanner.WebApp/Roblox.CookieBanner.WebApp/ts/react/cookieBannerV3/containers/ConsentTool';

function CookieConsentLink({ translate }) {
  const [nonEssentialCookieList, updateNonEssentialCookieList] = useState([]);
  const [essentialCookieList, updateEssentialCookieList] = useState([]);
  const [showConsentTool, updateConsentToolVisibility] = useState(false);

  const openConsentTool = () => {
    updateConsentToolVisibility(true);
  };

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
  const consentTool = showConsentTool ? (
    <ConsentTool
      nonEssentialCookieList={nonEssentialCookieList}
      essentialCookieList={essentialCookieList}
      translate={translate}
      closeConsentTool={() => updateConsentToolVisibility()}
    />
  ) : null;
  if (essentialCookieList.length > 0) {
    return (
      <div>
        <Button
          onClick={openConsentTool}
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
