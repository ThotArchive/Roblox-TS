import Roblox from 'Roblox';
import '../../../css/homePageUpsellCard/homePageUpsellCard.scss';
import { getHomePageUpsellCardVariation, getVoicePolicy } from './services/accountInfoService';

// Expose service to internal apps
Roblox.HomePageUpsellCardService = {
  getHomePageUpsellCardVariation,
  getVoicePolicy
};
