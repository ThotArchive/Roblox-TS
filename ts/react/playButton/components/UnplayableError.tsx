import { TranslateFunction, withTranslations } from 'react-utilities';
import React from 'react';
import { TPlayabilityStatus, TPlayabilityStatuses } from '../types/playButtonTypes';
import playButtonConstants from '../constants/playButtonConstants';
import playButtonTranslationConfig from '../../../../translation.config';

const { playButtonStatusTranslationMap } = playButtonConstants;

export type TErrorProps = {
  playabilityStatus: Exclude<
    TPlayabilityStatus,
    | TPlayabilityStatuses['Playable']
    | TPlayabilityStatuses['GuestProhibited']
    | TPlayabilityStatuses['PurchaseRequired']
    | TPlayabilityStatuses['ContextualPlayabilityUnverifiedSeventeenPlusUser']
  >;
  errorClassName?: string;
};

export const Error = ({
  translate,
  playabilityStatus,
  errorClassName = 'error-message'
}: TErrorProps & {
  translate: TranslateFunction;
}): JSX.Element => (
  <span data-testid='play-error' className={errorClassName}>
    {translate(playButtonStatusTranslationMap[playabilityStatus])}
  </span>
);

export default withTranslations<TErrorProps>(Error, playButtonTranslationConfig);
