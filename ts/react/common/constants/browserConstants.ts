// Container IDs
export const homePageContainerId = 'place-list';
export const homePageContainer = (): HTMLElement | null =>
  document.getElementById(homePageContainerId);
export const navigationContainerId = 'navigation-container';
export const navigationContainer = (): HTMLElement | null =>
  document.getElementById(navigationContainerId);
export const recommendedGamesContainerId = 'recommended-games-container';
export const recommendedGamesContainer = (): HTMLElement | null =>
  document.getElementById(recommendedGamesContainerId);
export const gameStoreContainerId = 'game-store-container';
export const gameStoreContainer = (): HTMLElement | null =>
  document.getElementById(gameStoreContainerId);
export const gameStorePreviewContainerId = 'game-details-about-store-preview';
export const gameStorePreviewContainer = (): HTMLElement | null =>
  document.getElementById(gameStorePreviewContainerId);

// URL Params
export const queryParams = {
  keyword: 'keyword'
};

// URL Paths
export const url = {
  sortDetail: (sortName: string): string => `discover#/sortName/${sortName}`,
  sortDetailV2: (sortName: string): string => `discover#/sortName/v2/${sortName}`
};

export const chartsUrl = {
  sortDetail: (sortName: string): string => `charts#/sortName/${sortName}`
};
