import React, { useState, useEffect } from 'react';
import { withTranslations } from 'react-utilities';
import { SimpleModal } from 'react-style-guide';
import {
  VerifiedBadgeTextContainer,
  verifiedBadgeTextContainerReactRenderClass,
  VerifiedBadgeIcon,
  verifiedBadgeIconReactRenderClass,
  PremiumBadgeIcon,
  BadgeSizes
  // TODO(dlouie, 08/16/22): create a lint rule that enforces outside of this file developers use:
  // import {} from 'roblox-badges'
} from '@rbx/badge-components/dist';
// eslint-disable-next-line import/no-named-as-default
import translationConfig from './translation.config';

import '../../../css/RobloxBadges/RobloxBadges.scss';

import { fetchTranslations } from './verifiedBadgeTranslations';

import {
  currentUserHasVerifiedBadge,
  currentUserHasPremium,
  getCurrentUserId
} from '../../../ts/common/currentUserBadgeInfo';

export {
  verifiedBadgeTextContainerReactRenderClass,
  verifiedBadgeIconReactRenderClass
} from '@rbx/badge-components/dist';

const defaultInitParams = {
  initCallback: () => {},
  overrideIconClass: '',
  overrideContainerClass: ''
};

const dataAttrToReactAttrMap = {
  icontheme: 'iconTheme',
  size: 'size',
  titletext: 'titleText',
  additionalcontainerclass: 'additionalContainerClass',
  overridecontainerclass: 'overrideContainerClass',
  additionalimgclass: 'additionalImgClass',
  overrideimgclass: 'overrideImgClass',
  showverifiedbadge: 'showVerifiedBadge',
  text: 'text',
  textel: 'textEl',
  badgeel: 'badgeEl',
  overridetextcontainerclass: 'overrideTextContainerClass',
  overridewrapperclass: 'overridewrapperClass',
  additionaltextcontainerclass: 'additionalTextContainerClass',
  additionalwrapperclass: 'additionalWrapperClass',
  oniconclick: 'onIconClick'
};

const disableModalDataAttr = 'disablemodal';

const ready = fn => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
};

export const robloxBadgesReadyForRender = async () => {
  try {
    const depsExist =
      typeof window.RobloxBadges !== 'undefined' &&
      typeof window.React !== 'undefined' &&
      typeof window.ReactDOM !== 'undefined';
    return depsExist;
  } catch (e) {
    return false;
  }
};

const verifiedBadgeInfoModalId = 'verified-badge-info-modal';

let updateOutside = () => {};

const openVerifiedBadgeMoreInfoModal = () => {
  updateOutside(true);
};

const closeVerifiedBadgeMoreInfoModal = () => {
  updateOutside(false);
};

const robloxVerifiedBadgeFAQPageUrl = 'https://en.help.roblox.com/hc/articles/7997207259156';

const openLearnMoreVerifiedBadgeFAQLink = () => {
  window.open(robloxVerifiedBadgeFAQPageUrl, '_blank');
};

export const VerifiedBadgeInfoModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    /* Assign update to outside variable */
    updateOutside = setShowModal;

    /* Unassign when component unmounts */
    return () => {
      updateOutside = null;
    };
  }, []);

  const translations = fetchTranslations();

  const modalBody = (
    <div>
      <div>
        <VerifiedBadgeIcon
          overrideContainerClass='hz-centered-badge-container'
          size={BadgeSizes.TITLE}
          titleText={translations.translatedVerifiedBadgeModalTitleText}
        />
      </div>
      <div>{translations.translatedVerifiedBadgeModalBodyText}</div>
    </div>
  );

  return (
    <React.Fragment>
      <SimpleModal
        title={translations.translatedVerifiedBadgeModalTitleText}
        show={showModal}
        body={modalBody}
        actionButtonShow
        actionButtonText={translations.translatedVerifiedBadgeModalLearnMoreLinkText}
        neutralButtonText={translations.translatedVerifiedBadgeModalCloseButtonText}
        onClose={closeVerifiedBadgeMoreInfoModal}
        onNeutral={closeVerifiedBadgeMoreInfoModal}
        onAction={openLearnMoreVerifiedBadgeFAQLink}
      />
    </React.Fragment>
  );
};

const VerifiedBadgeIconContainerNoTranslations = props => {
  let { titleText } = props;
  if (titleText === null || titleText === undefined) {
    titleText = props.translate('Creator.VerifiedBadgeIconAccessibilityText');
  }

  return <VerifiedBadgeIcon {...props} titleText={titleText} />;
};
export const VerifiedBadgeIconContainer = withTranslations(
  VerifiedBadgeIconContainerNoTranslations,
  translationConfig
);

const VerifiedBadgeStringContainerNoTranslations = props => {
  let { titleText } = props;
  if (titleText === null || titleText === undefined) {
    titleText = props.translate('Creator.VerifiedBadgeIconAccessibilityText');
  }

  return <VerifiedBadgeTextContainer {...props} titleText={titleText} />;
};
export const VerifiedBadgeStringContainer = withTranslations(
  VerifiedBadgeStringContainerNoTranslations,
  translationConfig
);

export const initRobloxBadgesFrameworkAgnostic = async ({
  initCallback,
  overrideIconClass,
  overrideContainerClass
} = defaultInitParams) => {
  try {
    if (await window.RobloxBadges.robloxBadgesReadyForRender()) {
      const verifiedBadgeTextContainers = document.querySelectorAll(
        `.${
          overrideContainerClass || window.RobloxBadges.verifiedBadgeTextContainerReactRenderClass
        }`
      );

      const verifiedBadges = document.querySelectorAll(
        `.${overrideIconClass || window.RobloxBadges.verifiedBadgeIconReactRenderClass}`
      );

      const renderVerifiedBadge = ({ verifiedBadgeIconProps, verifiedBadge }) => {
        const iconToRender = document.createElement('span');

        const reactElToRender = window.React.createElement(
          window.RobloxBadges.VerifiedBadgeIcon,
          verifiedBadgeIconProps
        );

        window.ReactDOM.render(reactElToRender, iconToRender);

        const parentOfIcon = verifiedBadge.parentNode;
        parentOfIcon.replaceChild(iconToRender, verifiedBadge);

        return parentOfIcon;
      };

      const renderVerifiedBadgeContainer = ({
        verifiedBadgeTextContainerProps,
        verifiedBadgeTextContainerEl
      }) => {
        const elToRender = document.createElement('span');

        const reactElToRender = window.React.createElement(
          window.RobloxBadges.VerifiedBadgeTextContainer,
          verifiedBadgeTextContainerProps
        );

        window.ReactDOM.render(reactElToRender, elToRender);

        const parentOfIcon = verifiedBadgeTextContainerEl.parentNode;
        parentOfIcon.replaceChild(elToRender, verifiedBadgeTextContainerEl);

        return parentOfIcon;
      };

      const verifiedBadgeInfoModal = document.querySelectorAll(`#${verifiedBadgeInfoModalId}`);

      if (verifiedBadgeInfoModal.length === 0) {
        const modalToRender = document.createElement('span');

        modalToRender.setAttribute('id', verifiedBadgeInfoModalId);

        document.body.appendChild(modalToRender);

        const verifiedBadgeInfoModalEl = window.React.createElement(
          window.RobloxBadges.VerifiedBadgeInfoModal
        );

        window.ReactDOM.render(verifiedBadgeInfoModalEl, modalToRender);
      }

      const translations = fetchTranslations();

      for (let i = 0; i < verifiedBadgeTextContainers.length; i++) {
        const verifiedBadgeTextContainerEl = verifiedBadgeTextContainers[i];
        const verifiedBadgeTextContainerProps = {
          titleText: translations.translatedVerifiedBadgeTitleText,
          onIconClick: openVerifiedBadgeMoreInfoModal
        };

        const keysToTransform = Object.keys(verifiedBadgeTextContainerEl.dataset);

        for (let j = 0; j < keysToTransform.length; j++) {
          const lowercasePropName = keysToTransform[j];
          const badgePropName = dataAttrToReactAttrMap[lowercasePropName];
          const propValue = verifiedBadgeTextContainerEl.dataset[lowercasePropName];

          if (badgePropName) {
            verifiedBadgeTextContainerProps[badgePropName] = propValue;
          } else if (lowercasePropName === disableModalDataAttr) {
            verifiedBadgeTextContainerProps.onIconClick = () => {};
          }
        }
        renderVerifiedBadgeContainer({
          verifiedBadgeTextContainerProps,
          verifiedBadgeTextContainerEl
        });
      }

      for (let i = 0; i < verifiedBadges.length; i++) {
        const verifiedBadge = verifiedBadges[i];

        const verifiedBadgeIconProps = {
          titleText: translations.translatedVerifiedBadgeTitleText,
          onIconClick: openVerifiedBadgeMoreInfoModal
        };

        const keysToTransform = Object.keys(verifiedBadge.dataset);

        for (let j = 0; j < keysToTransform.length; j++) {
          const lowercasePropName = keysToTransform[j];
          const badgePropName = dataAttrToReactAttrMap[lowercasePropName];
          const propValue = verifiedBadge.dataset[lowercasePropName];

          if (badgePropName) {
            verifiedBadgeIconProps[badgePropName] = propValue;
          } else if (lowercasePropName === disableModalDataAttr) {
            verifiedBadgeIconProps.onIconClick = () => {};
          }
        }
        renderVerifiedBadge({ verifiedBadgeIconProps, verifiedBadge });
      }
    }
  } catch (e) {
    // noop
  } finally {
    if (typeof initCallback === 'function') {
      initCallback();
    }
  }
};

window.RobloxBadges = {
  ready,
  verifiedBadgeTextContainerReactRenderClass,
  verifiedBadgeIconReactRenderClass,
  PremiumBadgeIcon,
  robloxBadgesReadyForRender,
  BadgeSizes,
  initRobloxBadgesFrameworkAgnostic,
  VerifiedBadgeTextContainer,
  VerifiedBadgeStringContainer,
  VerifiedBadgeIcon,
  VerifiedBadgeIconContainer,
  currentUserHasVerifiedBadge,
  currentUserHasPremium,
  getCurrentUserId,
  VerifiedBadgeInfoModal,
  fetchTranslations
};
