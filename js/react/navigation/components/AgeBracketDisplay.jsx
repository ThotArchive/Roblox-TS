import React, { useEffect, useRef, useState } from 'react';
import { authenticatedUser } from 'header-scripts';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { BadgeSizes, VerifiedBadgeIconContainer, currentUserHasVerifiedBadge } from 'roblox-badges';
import { PresenceStatusIcon } from 'roblox-presence';
import { CurrentUser, ExperimentationService } from 'Roblox';
import links from '../constants/linkConstants';
import userUtil from '../util/userUtil';

function AgeBracketDisplay({ translate }) {
  const renderEl = useRef(null);

  const { isUnder13 } = authenticatedUser;

  const badgeToRender =
    currentUserHasVerifiedBadge() && VerifiedBadgeIconContainer ? (
      <section
        ref={el => {
          renderEl.current = el;
        }}>
        <VerifiedBadgeIconContainer
          overrideImgClass='verified-badge-icon-header'
          size={BadgeSizes.CAPTIONHEADER}
        />
      </section>
    ) : null;

  const [showNavBarPresence, setShowNavBarPresence] = useState(false);
  useEffect(() => {
    async function getNavBarPresenceExperiment() {
      try {
        // TODO: clean up experiment flags (SACQ-718)
        const navBarPresenceExpLayer = 'Social.Friends';
        const layerValues = await ExperimentationService.getAllValuesForLayer(
          navBarPresenceExpLayer
        );
        setShowNavBarPresence(layerValues.invisibleModeAllowed ?? false);
      } catch (e) {
        console.error(e);
      }
    }

    getNavBarPresenceExperiment();
  }, []);

  return (
    <div className='age-bracket-label text-header'>
      <Link
        className='text-link dynamic-overflow-container'
        url={links.scrollListItems.profile.url}>
        <span className='avatar avatar-headshot-xs'>
          <Thumbnail2d
            containerClass='avatar-card-image'
            targetId={authenticatedUser.id}
            type={ThumbnailTypes.avatarHeadshot}
            altName={authenticatedUser.name}
          />
          {showNavBarPresence && CurrentUser.userId && (
            <PresenceStatusIcon
              translate={translate}
              className='avatar-status'
              userId={Number.parseInt(CurrentUser.userId, 10)}
            />
          )}
        </span>
        <span className='text-overflow age-bracket-label-username font-caption-header'>
          {userUtil.nameForDisplay}
        </span>
        {badgeToRender}
      </Link>
      <span className='xsmall age-bracket-label-age text-secondary'>
        {isUnder13 ? '<13' : '13+'}
      </span>
    </div>
  );
}

AgeBracketDisplay.propTypes = {
  translate: PropTypes.func.isRequired
};

export default AgeBracketDisplay;
