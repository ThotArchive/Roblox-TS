import { useState, useEffect } from 'react';
import playButtonService from '../services/playButtonService';
import { TSettingResponse } from '../types/playButtonTypes';
import { getMinimumAgeFromAgeRecommendationResponse } from '../utils/playButtonUtils';

type TParentalControlsUpsellData = {
  contentAgeRestriction: TSettingResponse | undefined;
  minimumAge: number | undefined;
  isFetching: boolean;
  hasError: boolean;
};

/**
 * Fetches the experience's minimumAge and the user's contentAgeRestriction setting,
 * which will be used to determine which upsell modal to display.
 */
const useFetchParentalControlsUpsellData = (universeId: string): TParentalControlsUpsellData => {
  const [contentAgeRestriction, setContentAgeRestrictionResponse] = useState<
    TSettingResponse | undefined
  >(undefined);
  const [isFetchingSettings, setIsFetchingSettings] = useState<boolean>(false);

  const [minimumAge, setMinimumAge] = useState<number | undefined>(undefined);
  const [isFetchingAgeRecommendation, setIsFetchingAgeRecommendation] = useState<boolean>(false);

  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsFetchingSettings(true);
    playButtonService
      .getUserSettingsAndOptions()
      .then(response => {
        setContentAgeRestrictionResponse(response?.contentAgeRestriction);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsFetchingSettings(false));
  }, []);

  useEffect(() => {
    setIsFetchingAgeRecommendation(true);
    playButtonService
      .getAgeRecommendation(universeId)
      .then(response => {
        setMinimumAge(getMinimumAgeFromAgeRecommendationResponse(response));
      })
      .catch(() => setHasError(true))
      .finally(() => setIsFetchingAgeRecommendation(false));
  }, [universeId]);

  return {
    contentAgeRestriction,
    minimumAge,
    isFetching: isFetchingSettings || isFetchingAgeRecommendation,
    hasError
  };
};

export default useFetchParentalControlsUpsellData;
