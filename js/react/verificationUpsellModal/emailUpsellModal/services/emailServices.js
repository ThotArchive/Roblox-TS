import { httpService } from 'core-utilities';
import {
  getEmailUrlConfig,
  getEmailVerificationUrlConfig,
  getMetadataV2UrlConfig,
  getLogoutContactMethodModalExperimentConfig,
  verificationUpsellModalLogoutExperimentParameters
} from '../../common/constants/urlConstants';
import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import getErrorCodeFromRequestError from '../../common/utils/requestUtils';
import { sectionValues } from '../../common/constants/loggingConstants';

export const sendEmailVerification = () => {
  const urlConfig = getEmailVerificationUrlConfig();
  return httpService.post(urlConfig).then(
    () => {
      return true;
    },
    e => {
      return getErrorCodeFromRequestError(e);
    }
  );
};

export const updateEmailAddress = formData => {
  const urlConfig = getEmailUrlConfig();
  return httpService.post(urlConfig, formData).then(
    () => {
      return true;
    },
    e => {
      return getErrorCodeFromRequestError(e);
    }
  );
};

export const getUserEmailStatusAndOpenModal = params => {
  const urlConfig = getEmailUrlConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      if (!data?.emailAddress || (params.requireVerification && !data.verified)) {
        const event = new CustomEvent('OpenVerificationModal', {
          detail: {
            isEmailVerified: data.verified,
            email: data?.emailAddress,
            skipCallback: params.skipCallback,
            origin: params.origin,
            experimentParameters: params?.experimentParameters,
            requireVerification: params.requireVerification,
            closeCallback: params.closeCallback
          }
        });
        window.dispatchEvent(event);
      }
      return data;
    },
    e => {
      console.log(e);
      return false;
    }
  );
};

export const getMetadataV2 = async () => {
  const urlConfig = getMetadataV2UrlConfig();
  return httpService.get(urlConfig);
};

export const getLogoutContactMethodModalExperimentParameters = async () => {
  const urlConfig = getLogoutContactMethodModalExperimentConfig();
  const experimentParameters = {
    parameters: Object.values(verificationUpsellModalLogoutExperimentParameters).join(',')
  };
  return httpService.get(urlConfig, experimentParameters);
};

export const handleUserEmailUpsellAtLogout = async skipCallback => {
  const metadata = await getMetadataV2();
  if (!metadata.data?.IsEmailUpsellAtLogoutEnabled) {
    // see if ab test is turned off
    return false;
  }

  let experimentParameters = {};
  try {
    experimentParameters = await getLogoutContactMethodModalExperimentParameters();
  } catch (ex) {
    // do nothing
  }
  const { Logout } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({
    // pass in IXP params of the string resources needed.
    // call them: LogoutPrimaryText, LogoutBodyText, etc to point them
    // to resources. This gets you translations but also no direct code
    // change needed to optimize
    origin: Logout,
    experimentParameters: experimentParameters?.data,
    skipCallback
  });
};

export const handleUserEmailUpsellAtBuyRobux = skipCallback => {
  const { BuyRobux } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: BuyRobux, skipCallback });
};

export const handleUserEmailUpsellOnHomePage = closeCallback => {
  const { HomePage } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: HomePage, closeCallback });
};

export const handleUserEmailVerificationRequiredByPurchaseWarning = () => {
  const { PurchaseWarning } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: PurchaseWarning, requireVerification: true });
};

export const handleUserEmailUpsellAtPremiumSubscription = skipCallback => {
  const { SubscriptionPurchase } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: SubscriptionPurchase, skipCallback });
};

export const handleUserEmailVerificationRequiredByBan = () => {
  const { NotApprovedPage } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: NotApprovedPage, requireVerification: true });
};

export const getUserEmailAddress = () => {
  const urlConfig = getEmailUrlConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      return data?.emailAddress;
    },
    e => {
      console.log(e);
      return false;
    }
  );
};

export const validateEmailAddress = email => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
