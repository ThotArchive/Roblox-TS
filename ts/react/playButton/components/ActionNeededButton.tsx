import React, { useState, useEffect } from 'react';
import { Loading, Button } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { ExperimentationService } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { TPlayabilityStatuses } from '../types/playButtonTypes';
import playButtonConstants from '../constants/playButtonConstants';
import { startAccessManagementUpsellFlow } from '../utils/playButtonUtils';
import playButtonTranslationConfig from '../../../../translation.config';
import { PlayButton } from './PlayButton';

const { playButtonTextTranslationMap, counterEvents, playButtonLayer } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TActionNeededProps = {
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
};

export const ActionNeededButton = ({
  translate,
  iconClassName = 'icon-status-private-inverse',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-action-needed-lg'
}: TActionNeededProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  const handleClick = async () => {
    // result can be used for success/failure callback cases in the future
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const success = await startAccessManagementUpsellFlow();
  };

  return (
    <Button
      data-testid='play-action-needed-button'
      width={buttonWidth}
      className={buttonClassName}
      onClick={handleClick}>
      <span className={iconClassName} />
      <span className='btn-text'>{translate(playButtonTextTranslationMap.ActionNeeded)}</span>{' '}
    </Button>
  );
};

export const WithTranslationActionNeededButton = withTranslations<TActionNeededProps>(
  ActionNeededButton,
  playButtonTranslationConfig
);

export type TActionNeededWrapperProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  status: TPlayabilityStatuses['ContextualPlayabilityUnverifiedSeventeenPlusUser'];
  eventProperties?: Record<string, string | number | undefined>;
};

// temporary wrapper component to wait for ixp, clean up when cleaning up hasUpdatedPlayButtonsIxp as true
export const ActionNeededWrapper = ({
  universeId,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  status,
  eventProperties = {}
}: TActionNeededWrapperProps): JSX.Element => {
  const [hasUpdatedPlayButtonsIxp, setHasUpdatedPlayButtonsIxp] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    if (ExperimentationService.getAllValuesForLayer) {
      ExperimentationService.getAllValuesForLayer(playButtonLayer)
        .then(playButtonVariables => {
          setHasUpdatedPlayButtonsIxp(playButtonVariables.HasUpdatedPlayButtons === true);
        })
        .catch(() => {
          fireEvent(counterEvents.PlayButtonIXPError);
          setHasUpdatedPlayButtonsIxp(false);
        });
    } else {
      setHasUpdatedPlayButtonsIxp(false);
    }
  }, []);

  if (hasUpdatedPlayButtonsIxp === undefined) {
    return <Loading />;
  }

  if (hasUpdatedPlayButtonsIxp) {
    fireEvent(counterEvents.ActionNeededTreatment);
    return <WithTranslationActionNeededButton />;
  }

  return (
    <PlayButton
      universeId={universeId}
      placeId={placeId}
      rootPlaceId={rootPlaceId}
      privateServerLinkCode={privateServerLinkCode}
      gameInstanceId={gameInstanceId}
      status={status}
      eventProperties={eventProperties}
    />
  );
};
