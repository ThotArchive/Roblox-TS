import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import AvatarShopHomepageRecommendationsCarousel from './containers/AvatarShopHomepageRecommendationsCarousel';
import '../../../css/avatarShopHomepageRecommendations/avatarShopHomepageRecommendations.scss';

function renderApp() {
  const containerElement = document.getElementById('avatar-shop-homepage-recommendations');
  if (containerElement) {
    render(<AvatarShopHomepageRecommendationsCarousel />, containerElement);
  } else {
    window.requestAnimationFrame(renderApp);
  }
}
ready(() => {
  renderApp();
});

window.Roblox.AvatarShopHomepageRecommendations = AvatarShopHomepageRecommendationsCarousel;
