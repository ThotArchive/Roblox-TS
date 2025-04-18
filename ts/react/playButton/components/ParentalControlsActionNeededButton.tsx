import React, { useCallback } from 'react';
import { Loading } from 'react-style-guide';
import { TranslateFunction, withTranslations } from 'react-utilities';
import ActionNeededButton from './ActionNeededButton';
import SelfUpdateSettingModal from './SelfUpdateSettingModal';
import playButtonTranslationConfig from '../../../../translation.config';
import RestrictedUnplayableModal from './RestrictedUnplayableModal';
import useFetchParentalControlsUpsellData from '../hooks/useFetchParentalControlsUpsellData';
import useContextualParentalControlsUpsell from '../hooks/useContextualParentalControlsUpsell';

type TParentalControlsActionNeededButtonProps = {
  universeId: string;
  hideButtonText?: boolean;
  buttonClassName?: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
};

export const ParentalControlsActionNeededButton = ({
  universeId,
  hideButtonText,
  buttonClassName,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  translate
}: TParentalControlsActionNeededButtonProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  const {
    contentAgeRestriction,
    minimumAge,
    isFetching,
    hasError
  } = useFetchParentalControlsUpsellData(universeId);

  const {
    launchPlayButtonUpsell,
    isSelfUpdateSettingModalOpen,
    navigateToAccountSettings,
    closeSelfUpdateSettingModal,
    isRestrictedUnplayableModalOpen,
    closeRestrictedUnplayableModal
  } = useContextualParentalControlsUpsell(
    placeId,
    universeId,
    rootPlaceId,
    privateServerLinkCode,
    gameInstanceId,
    eventProperties
  );

  const onPlayButtonClick = useCallback(
    (e: React.MouseEvent<Element>) => {
      e.preventDefault();
      e.stopPropagation();

      launchPlayButtonUpsell(contentAgeRestriction, minimumAge, hasError);
    },
    [launchPlayButtonUpsell, contentAgeRestriction, minimumAge, hasError]
  );

  if (!hasError && isFetching) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <ActionNeededButton
        onButtonClick={onPlayButtonClick}
        hideButtonText={hideButtonText}
        buttonClassName={buttonClassName}
      />
      {isSelfUpdateSettingModalOpen && (
        <SelfUpdateSettingModal
          isModalOpen={isSelfUpdateSettingModalOpen}
          navigateToAccountSettings={navigateToAccountSettings}
          closeModal={closeSelfUpdateSettingModal}
          translate={translate}
        />
      )}
      {isRestrictedUnplayableModalOpen && (
        <RestrictedUnplayableModal
          isModalOpen={isRestrictedUnplayableModalOpen}
          closeModal={closeRestrictedUnplayableModal}
          translate={translate}
        />
      )}
    </React.Fragment>
  );
};

ParentalControlsActionNeededButton.defaultProps = {
  hideButtonText: undefined,
  buttonClassName: undefined,
  rootPlaceId: undefined,
  privateServerLinkCode: undefined,
  gameInstanceId: undefined,
  eventProperties: {}
};

export default withTranslations<TParentalControlsActionNeededButtonProps>(
  ParentalControlsActionNeededButton,
  playButtonTranslationConfig
);
