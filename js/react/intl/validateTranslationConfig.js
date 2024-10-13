import { namespaceDelimiter, requiredNamespaceNestingLevel } from './intl.config';

// clean this up when moving RobloxError into Roblox
const { RobloxError } = window;
const normalizeNamespaceName = namespaceName => {
  if (typeof namespaceName !== 'string') {
    new RobloxError('Invalid namespace name, required a string').throw();
    return null;
  }
  return namespaceName.split(namespaceDelimiter);
};

export default function validateTranslationConfig(config) {
  const { common, feature } = config;

  const validatedConfig = {};
  if (
    !Array.isArray(common) ||
    // null is allowed for feature to indicate no feature specific namespace
    (feature !== null && typeof feature !== 'string')
  ) {
    new RobloxError('Invalid namespaces config!').throw();
    return validatedConfig;
  }

  return Object.assign(validatedConfig, {
    feature,
    common: common.filter(namespace => {
      const namespaceInfo = normalizeNamespaceName(namespace);
      // in prod, either undefined or split array
      if (Array.isArray(namespaceInfo) && namespaceInfo.length === requiredNamespaceNestingLevel) {
        return true;
      }
      return false;
    })
  });
}
