import { EnvironmentUrls, Intl } from 'Roblox';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SimpleModal } from 'react-style-guide';
import { authenticatedUser } from 'header-scripts';
import links from '../constants/linkConstants';
import layoutConstants from '../constants/layoutConstants';
import LeftNavItem from './LeftNavItem';
import SponsoredEventsContainer from '../containers/SponsoredEventsContainer';
import navigationUtil from '../util/navigationUtil';
import platformEventConstants from '../constants/platformEventConstants';

const { shopEvents } = layoutConstants;
const turnOnEventLabel = false; // kill the Event on the NavBar

function ScrollList({ translate, ...props }) {
  const [isShopModalOpen, setShopModalOpen] = useState(false);

  const onClickShopLink = useCallback(() => {
    setShopModalOpen(isOpen => !isOpen);
    navigationUtil.sendClickEvent(shopEvents.clickMerchandise);
  }, []);

  const closeShopModel = () => {
    setShopModalOpen(false);
  };

  const goToAmazonStop = () => {
    const decodedUrl = decodeURIComponent(EnvironmentUrls.amazonWebStoreLink);
    window.open(decodedUrl, '_blank');
    navigationUtil.sendClickEvent(shopEvents.goToAmazonStore);
  };

  const listNavItems = Object.values(links.scrollListItems).map(item => (
    <LeftNavItem key={item.name} {...{ translate, onClickShopLink, ...item, ...props }} />
  ));

  const onUpgradeBtnClick = () => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEFT_NAVIGATION_BAR,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      authenticatedUser.isPremiumUser
        ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.PREMIUM
        : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM
    );
  };

  const upgradeBtn = (
    <li className='rbx-upgrade-now'>
      <a
        href={links.upgradeButton.url}
        className='btn-growth-md btn-secondary-md'
        onClick={onUpgradeBtnClick}
        id='upgrade-now-button'>
        {translate(links.upgradeButton.labelTranslationKey)}
      </a>
    </li>
  );

  const modalBody = (
    <React.Fragment>
      <p className='shop-description'>{translate('Description.RetailWebsiteRedirect')}</p>
      <p className='shop-warning'>{translate('Description.PurchaseAgeWarning')}</p>
    </React.Fragment>
  );
  const shopModal = (
    <SimpleModal
      title={translate('Heading.LeavingRoblox')}
      body={modalBody}
      show={isShopModalOpen}
      actionButtonShow
      actionButtonText={translate('Action.Continue')}
      neutralButtonText={translate('Action.Cancel')}
      onAction={goToAmazonStop}
      onNeutral={closeShopModel}
      onClose={closeShopModel}
    />
  );

  const now = new Date(); // user's system time
  const showThumbnailTime = platformEventConstants.showPlatformEventStartTime();
  const hideThumbnailTime = platformEventConstants.showPlatformEventEndTime();
  const platformEventThumbnailUrl = platformEventConstants.platfromEventURL();
  const intl = Intl && new Intl();
  const platformEventThumbnailImage = platformEventConstants.localizedThumbnail(
    intl.getRobloxLocale()
  );
  const platformEventEntry = (
    <a href={platformEventThumbnailUrl} className='rbx-platform-event-container'>
      <div className='rbx-platform-event-header dynamic-overflow-container'>
        <span className='rbx-event-icon' />
        <span className='rbx-event-header-text dynamic-ellipsis-item'>
          {translate('Label.sEvents')}
        </span>
      </div>
      <img
        className='rbx-platform-event-thumbnail'
        src={platformEventThumbnailImage}
        alt={translate('Label.TheHunt')} // Despite the key, this is not actually specific to The Hunt
      />
    </a>
  );

  return (
    <ul className='left-col-list'>
      {listNavItems}
      {upgradeBtn}
      {turnOnEventLabel && <SponsoredEventsContainer translate={translate} />}
      {shopModal}
      {now > showThumbnailTime &&
        now < hideThumbnailTime &&
        platformEventThumbnailUrl &&
        platformEventEntry}
    </ul>
  );
}

ScrollList.defaultProps = {
  sponsoredPagesData: []
};

ScrollList.propTypes = {
  sponsoredPagesData: PropTypes.instanceOf(Array),
  translate: PropTypes.func.isRequired
};

export default ScrollList;
