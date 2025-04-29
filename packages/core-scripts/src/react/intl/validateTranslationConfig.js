import { namespaceDelimiter, requiredNamespaceNestingLevel } from "./intl.config";
// clean this up when moving RobloxError into Roblox
const { RobloxError } = window;
const normalizeNamespaceName = namespaceName => {
  if (typeof namespaceName !== "string") {
    new RobloxError("Invalid namespace name, required a string").throw();
    return null;
  }
  return namespaceName.split(namespaceDelimiter);
};

const isStringArray = arr => Array.isArray(arr) && arr.every(item => typeof item === "string");

const validateTranslationConfig = config => {
  const { common, feature, features } = config;

  const validatedConfig = {};
  if (
    !Array.isArray(common) ||
    // Only one of feature or features should be defined.
    (feature !== undefined && features !== undefined) ||
    (!!feature && typeof feature !== "string") ||
    // features should be an array
    (!!features && !isStringArray(features))
  ) {
    new RobloxError("Invalid namespaces config!").throw();
    return validatedConfig;
  }

  return Object.assign(validatedConfig, {
    feature,
    features,
    common: common.filter(namespace => {
      const namespaceInfo = normalizeNamespaceName(namespace);
      // in prod, either undefined or split array
      if (Array.isArray(namespaceInfo) && namespaceInfo.length === requiredNamespaceNestingLevel) {
        return true;
      }
      return false;
    }),
  });
};

export default validateTranslationConfig;
