import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const getAmpFeatureCheckUrlConfig = (featureName: string) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/v1/feature-access`
});

const getAmpUpsellUrlConfig = (featureName: string) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}`
});

const getAmpUpsellWithParametersUrlConfig = (
  featureName: string,
  extraParameters: string = null
) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}&extraParameters=${extraParameters}`
});

export { getAmpFeatureCheckUrlConfig, getAmpUpsellUrlConfig, getAmpUpsellWithParametersUrlConfig };
