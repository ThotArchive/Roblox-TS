// eslint-disable-next-line import/prefer-default-export
export const getVersionName = shouldPrefillAffirmativeDiscoverabilityConsent => {
  // EU users are not permitted to be prefilled and opt-out
  if (shouldPrefillAffirmativeDiscoverabilityConsent) {
    return 'non_eu_version';
  }
  return 'eu_version';
};
