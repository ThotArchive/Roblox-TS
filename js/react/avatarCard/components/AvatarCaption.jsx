import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { DisplayNames } from 'Roblox';
import AvatarCaptionTitle from './AvatarCaptionTitle';
import AvatarCaptionFirstLine from './AvatarCaptionFirstLine';
import AvatarCaptionSecondLine from './AvatarCaptionSecondLine';
import AvatarCaptionFooter from './AvatarCaptionFooter';

function constructUsernameLabel(username) {
  return username ? `@${username}` : '';
}

const AvatarCaption = ({
  name,
  nameLink,
  displayName,
  labelFirstLine,
  labelFirstLineLink,
  labelSecondLine,
  statusLink,
  statusLinkLabel,
  footer,
  hasMenu,
  truncateFirstLine,
  verifiedBadgeData
}) => {
  const classNames = ClassNames('avatar-card-caption', {
    'has-menu': hasMenu
  });
  const cardLabelClassNames = ClassNames('avatar-card-label', {
    shimmer: !name
  });
  const useAvatarCaptionFooter = typeof footer === 'string';
  return (
    <div className={classNames}>
      <span>
        {DisplayNames.Enabled() ? (
          <React.Fragment>
            <AvatarCaptionTitle
              title={displayName}
              titleLink={nameLink}
              verifiedBadgeData={verifiedBadgeData}
            />
            <div className={cardLabelClassNames}> {constructUsernameLabel(name)} </div>
          </React.Fragment>
        ) : (
          <AvatarCaptionTitle
            title={name}
            titleLink={nameLink}
            verifiedBadgeData={verifiedBadgeData}
          />
        )}
        <AvatarCaptionFirstLine
          firstLine={labelFirstLine}
          firstLineLink={labelFirstLineLink}
          isSingleLine={truncateFirstLine}
        />
        <AvatarCaptionSecondLine
          secondLine={labelSecondLine}
          status={statusLinkLabel}
          statusLink={statusLink}
        />
      </span>
      {useAvatarCaptionFooter ? <AvatarCaptionFooter footer={footer} /> : footer}
    </div>
  );
};

AvatarCaption.defaultProps = {
  name: '',
  nameLink: '',
  displayName: '',
  labelFirstLine: '',
  labelFirstLineLink: '',
  labelSecondLine: '',
  statusLink: '',
  statusLinkLabel: '',
  footer: undefined,
  hasMenu: false,
  truncateFirstLine: false,
  verifiedBadgeData: {}
};
AvatarCaption.propTypes = {
  name: PropTypes.string,
  nameLink: PropTypes.string,
  displayName: PropTypes.string,
  labelFirstLine: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  labelFirstLineLink: PropTypes.string,
  labelSecondLine: PropTypes.string,
  statusLink: PropTypes.string,
  statusLinkLabel: PropTypes.string,
  footer: PropTypes.node,
  hasMenu: PropTypes.bool,
  truncateFirstLine: PropTypes.bool,
  verifiedBadgeData: PropTypes.shape({
    hasVerifiedBadge: PropTypes.bool,
    titleText: PropTypes.string
  })
};

export default AvatarCaption;
