import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-style-guide';
import { homePage } from '../constants/configConstants';

type Props = {
  defaultSubtitle?: string;
  endTimestamp?: string;
  countdownString?: string;
  formatSubtitleLink?: boolean;
  subtitleLink?: string;
  handleSeeAllLinkClick?: () => void;
  backgroundImageAssetId?: number;
};

const { subtitleLinkStart, subtitleLinkEnd } = homePage;

const GameCarouselSubtitle: React.FC<Props> = ({
  defaultSubtitle,
  endTimestamp,
  countdownString,
  formatSubtitleLink,
  subtitleLink,
  handleSeeAllLinkClick,
  backgroundImageAssetId
}) => {
  const endTimestampInt = useMemo(() => {
    const int = endTimestamp && parseInt(endTimestamp, 10);
    if (int || int === 0) {
      return int;
    }
    return undefined;
  }, [endTimestamp]);

  const [countdownTimeRemaining, setCountdownTimeRemaining] = useState<number | undefined>(
    endTimestampInt !== undefined ? endTimestampInt - Math.floor(Date.now() / 1000) : undefined
  );
  useEffect(() => {
    if (endTimestampInt !== undefined) {
      setCountdownTimeRemaining(endTimestampInt - Math.floor(Date.now() / 1000));
      const timer = setInterval(() => {
        setCountdownTimeRemaining(endTimestampInt - Math.floor(Date.now() / 1000));
      }, 15000);
      return () => {
        clearInterval(timer);
      };
    }
    setCountdownTimeRemaining(undefined);
    return undefined;
  }, [endTimestampInt]);

  const subtitle = useMemo(() => {
    if (countdownTimeRemaining !== undefined && countdownString) {
      let hours = 0;
      let minutes = 0;
      if (countdownTimeRemaining > 0) {
        minutes = Math.ceil(countdownTimeRemaining / 60);
        hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
      }
      if (hours < 24) {
        return countdownString
          .replace('{hours}', hours.toString())
          .replace('{minutes}', minutes.toString());
      }
    }
    return defaultSubtitle;
  }, [defaultSubtitle, countdownTimeRemaining, countdownString]);

  const renderSubtitleWithLink = useMemo(() => {
    if (formatSubtitleLink && subtitleLink && subtitle) {
      const startIdx = subtitle.indexOf(subtitleLinkStart);
      const endIdx = subtitle.indexOf(subtitleLinkEnd);

      if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        const prefix = subtitle.slice(0, startIdx);
        const linkText = subtitle.slice(startIdx + subtitleLinkStart.length, endIdx);
        const suffix = subtitle.slice(endIdx + subtitleLinkEnd.length);

        return (
          <Link url={subtitleLink} onClick={handleSeeAllLinkClick}>
            {prefix}
            <span className='link-text'>{linkText}</span>
            {suffix}
            {backgroundImageAssetId ? (
              <span className='icon-chevron-right-dark' />
            ) : (
              <span className='icon-chevron-right' />
            )}
          </Link>
        );
      }
    }
    return subtitle;
  }, [subtitle, subtitleLink, backgroundImageAssetId, handleSeeAllLinkClick]);

  return subtitle ? (
    <div className='sort-subtitle-container'>
      <span className='font-sort-subtitle text-default'>{renderSubtitleWithLink}</span>
    </div>
  ) : null;
};

export default GameCarouselSubtitle;
