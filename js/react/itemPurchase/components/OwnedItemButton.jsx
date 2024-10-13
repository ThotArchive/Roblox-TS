import React from 'react';
import { withTranslations } from 'react-utilities';
import PropTypes from 'prop-types';
import { authenticatedUser, deviceMeta as DeviceMeta } from 'header-scripts';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import translationConfig from '../translation.config';
import urlConstants from '../constants/urlConstants';

const { resources, assetTypes, assetCategory } = itemPurchaseConstants;
const { getInventoryUrl } = urlConstants;

function OwnedItemButton({ translate, assetType }) {
  const deviceMetaData = DeviceMeta.getDeviceMeta();
  const isInPhone = deviceMetaData.deviceType === 'phone';
  const inventoryUrl = getInventoryUrl(authenticatedUser.id);
  let assetCategoryType;
  if (
    assetType === assetTypes.Plugin ||
    assetType === assetTypes.Decal ||
    assetType === assetTypes.Model ||
    assetType === assetTypes.Video ||
    assetType === assetTypes.Animation
  ) {
    assetCategoryType = assetCategory.Library;
  } else if (
    assetType === assetTypes.Place ||
    assetType === assetTypes.Badge ||
    assetType === assetTypes.GamePass ||
    assetType === assetTypes.Animation
  ) {
    assetCategoryType = null;
  } else {
    assetCategoryType = assetCategory.Catalog;
  }

  const isNavigationToInAppAvatarEditorEnabled = () => {
    if (assetCategoryType !== assetCategory.Catalog || deviceMetaData.isInApp) {
      return false;
    }
    if (
      (DeviceMeta.isAndroidApp || DeviceMeta.isIosApp) &&
      (DeviceMeta.isPhone || DeviceMeta.isTablet)
    ) {
      return true;
    }
    return false;
  };

  if (isNavigationToInAppAvatarEditorEnabled()) {
    return (
      <a id='open-in-avatar-editor-button' href='/#' className='btn-fixed-width-lg btn-control-md'>
        <span className='icon-nav-charactercustomizer' />
      </a>
    );
  }

  if (assetCategoryType === assetCategory.Catalog && !isInPhone) {
    return (
      <a id='edit-avatar-button' href='/my/avatar' className='btn-control-md'>
        <span className='icon-nav-charactercustomizer' />
      </a>
    );
  }

  return (
    <a id='inventory-button' href={inventoryUrl} className='btn-fixed-width-lg btn-control-md'>
      {translate(resources.inventoryAction)}
    </a>
  );
}

OwnedItemButton.propTypes = {
  translate: PropTypes.func.isRequired,
  assetType: PropTypes.number.isRequired
};

export default withTranslations(OwnedItemButton, translationConfig.itemResources);
