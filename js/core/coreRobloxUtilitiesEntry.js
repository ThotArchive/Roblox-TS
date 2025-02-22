import cryptoUtil from '../utilities/boundAuthTokens/crypto/cryptoUtil';
import boundAuthTokensHttpUtil from '../utilities/boundAuthTokens/http/boundAuthTokensHttpUtil';
import chatService from './services/chatService/chatService';
import dataStores from './dataStoreManagement/stores/dataStores';
import deepLinkService from './services/deepLinkService/deepLinkService';
import eventStreamService from './services/eventStreamService/eventStreamService';
import fido2Util from '../utilities/fido2/fido2Util';
import hybridService from './services/hybridService';
import hybridResponseService from './services/hybridResponseService';
import localStorageNames from './services/localStorageService/localStorageNames';
import localStorageService from './services/localStorageService/localStorageService';
import sessionStorageService from './services/sessionStorageService/sessionStorageService';
import metricsService from './services/metricsService/metricsService';
import paymentFlowAnalyticsService from './services/paymentFlowAnalyticsService/paymentFlowAnalyticsService';
import playGameService from './services/playGames/playGameService';
import userInfoService from './services/userInfoService/userInfoService';
import elementVisibilityService from './services/elementVisibilityService/elementVisibilityService';
import entityUrl from './utils/entityUrl/entityUrl';
// Note: importing the GCS interceptor has the side effect of running the initialization logic.
import initializeGenericChallengeInterceptor from './utils/jquery/genericChallengeInterceptor';
import upsellUtil from './utils/upsellUtil';
import pageHeartbeatInit from './pageHeartbeat/pageHeartbeatScheduler';

window.CoreRobloxUtilities = {
  cryptoUtil,
  boundAuthTokensHttpUtil,
  chatService,
  dataStores,
  entityUrl,
  eventStreamService,
  fido2Util,
  initializeGenericChallengeInterceptor,
  paymentFlowAnalyticsService,
  hybridService,
  hybridResponseService,
  localStorageService,
  localStorageNames,
  sessionStorageService,
  playGameService,
  userInfoService,
  metricsService,
  deepLinkService,
  elementVisibilityService,
  upsellUtil
};

pageHeartbeatInit().catch(console.error);
