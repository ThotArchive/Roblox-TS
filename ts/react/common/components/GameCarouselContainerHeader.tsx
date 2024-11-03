import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import GamesInfoTooltip from './GamesInfoTooltip';
import {
  CommonGameSorts,
  FeatureGameDetails,
  FeaturePlacesList
} from '../constants/translationConstants';
import eventStreamConstants, {
  TBuildNavigateToSortLinkEventProperties
} from '../constants/eventStreamConstants';
import GameCarouselSubtitle from './GameCarouselSubtitle';

type TGameCarouselContainerHeaderProps = {
  sortTitle: string;
  sortSubtitle?: string;
  seeAllLink: string;
  isSortLinkOverrideEnabled: boolean;
  buildNavigateToSortLinkEventProperties?: TBuildNavigateToSortLinkEventProperties;
  shouldShowSponsoredTooltip: boolean;
  tooltipInfoText?: string;
  titleContainerClassName: string;
  hideSeeAll?: boolean;
  endTimestamp?: string;
  countdownString?: string;
  backgroundImageAssetId?: number;
  translate: TranslateFunction;
};

const GameCarouselContainerHeader = ({
  sortTitle,
  sortSubtitle,
  seeAllLink,
  isSortLinkOverrideEnabled,
  buildNavigateToSortLinkEventProperties,
  shouldShowSponsoredTooltip,
  tooltipInfoText,
  titleContainerClassName,
  hideSeeAll,
  endTimestamp,
  countdownString,
  backgroundImageAssetId,
  translate
}: TGameCarouselContainerHeaderProps): JSX.Element => {
  const tooltipText = useMemo(() => {
    if (tooltipInfoText) {
      return tooltipInfoText;
    }

    if (shouldShowSponsoredTooltip) {
      return (
        translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
        'Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics.'
      );
    }

    return undefined;
  }, [shouldShowSponsoredTooltip, tooltipInfoText, translate]);

  const seeAllButtonText = useMemo(() => {
    if (isSortLinkOverrideEnabled) {
      return translate(FeatureGameDetails.LabelLearnMore);
    }

    return translate(FeaturePlacesList.ActionSeeAll);
  }, [isSortLinkOverrideEnabled, translate]);

  const handleSeeAllLinkClick = useCallback(() => {
    if (isSortLinkOverrideEnabled && buildNavigateToSortLinkEventProperties) {
      const params = buildNavigateToSortLinkEventProperties();
      const eventStreamParams = eventStreamConstants.navigateToSortLink(params);
      eventStreamService.sendEvent(...eventStreamParams);
    }
  }, [isSortLinkOverrideEnabled, buildNavigateToSortLinkEventProperties]);

  return (
    <div className='game-sort-header-container'>
      <div className={titleContainerClassName}>
        <h2 className='sort-header'>
          {hideSeeAll ? <span>{sortTitle}</span> : <Link url={seeAllLink}>{sortTitle}</Link>}
          {tooltipText && <GamesInfoTooltip tooltipText={tooltipText} />}
        </h2>
        {!hideSeeAll && (
          <Link
            url={seeAllLink}
            onClick={handleSeeAllLinkClick}
            className='btn-secondary-xs see-all-link-icon btn-more'>
            {seeAllButtonText}
          </Link>
        )}
      </div>
      <GameCarouselSubtitle
        defaultSubtitle={sortSubtitle}
        endTimestamp={endTimestamp}
        countdownString={countdownString}
        isSortLinkOverrideEnabled={isSortLinkOverrideEnabled}
        seeAllLink={seeAllLink}
        handleSeeAllLinkClick={handleSeeAllLinkClick}
        backgroundImageAssetId={backgroundImageAssetId}
      />
    </div>
  );
};

GameCarouselContainerHeader.defaultProps = {
  sortSubtitle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  buildNavigateToSortLinkEventProperties: undefined,
  backgroundImageAssetId: undefined
};

export default GameCarouselContainerHeader;
