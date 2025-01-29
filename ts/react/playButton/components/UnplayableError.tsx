import React from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonTranslationConfig from '../../../../translation.config';
import playButtonConstants from '../constants/playButtonConstants';
import { TPlayabilityStatusWithUnplayableError } from '../types/playButtonTypes';

const { playButtonErrorStatusTranslationMap, PlayabilityStatus } = playButtonConstants;

export type TErrorProps = {
  playabilityStatus: TPlayabilityStatusWithUnplayableError;
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
    {translate(
      playButtonErrorStatusTranslationMap[playabilityStatus]
        ? playButtonErrorStatusTranslationMap[playabilityStatus]
        : playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]
    )}
  </span>
);

export default withTranslations<TErrorProps>(Error, playButtonTranslationConfig);
