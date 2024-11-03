import React, { useRef } from 'react';
import { EventStream } from 'Roblox';
import { WithTranslationsProps } from 'react-utilities';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import { FeatureGamePage } from '../constants/translationConstants';
import '../../../../css/common/_gameTiles.scss';

export type TCreatorLabelProps = {
  universeId: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  linkUrl: string;
  isCreatorVerified: boolean;
  translate: WithTranslationsProps['translate'];
};

export const CreatorLabel = ({
  universeId,
  creatorName,
  creatorType,
  creatorId,
  linkUrl,
  isCreatorVerified,
  translate
}: TCreatorLabelProps): JSX.Element => {
  const renderEl = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    EventStream.SendEventWithTarget(
      'buttonClick',
      'featuredTileCreatorLabel',
      {
        creatorId,
        creatorType,
        universeId
      },
      EventStream.TargetTypes.WWW
    );
  };

  return (
    <div ref={renderEl} className='game-card-creator-name' data-testid='game-card-creator-name'>
      <span className='text-label creator-name-label'>
        {translate(FeatureGamePage.LabelByPrefix)}&nbsp;
      </span>
      <a
        href={linkUrl}
        onClick={() => handleClick()}
        className='text-overflow text-label creator-name'>
        {creatorName}
      </a>
      {isCreatorVerified && <VerifiedBadgeIconContainer size={BadgeSizes.CAPTIONHEADER} />}
    </div>
  );
};

export default CreatorLabel;
