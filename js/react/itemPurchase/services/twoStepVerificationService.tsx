import { httpService } from 'core-utilities';
import { CurrentUser } from 'Roblox';
import urlConstants from '../constants/urlConstants';

const {
  getTwoStepVerificationConfig,
  postGenerateTwoStepVerificationToken,
  postRedeemTwoStepVerificationChallenge
} = urlConstants;

type TTwoStepVerificationConfigMethod = {
  enabled: boolean;
  mediaType: string;
  updated: string;
};
type TTwoStepVerificationConfigRes = {
  methods: TTwoStepVerificationConfigMethod[];
  primaryMediaType: string;
};

export const checkTwoStepVerificationEnabled = async (): Promise<boolean> => {
  const urlConfig = {
    url: getTwoStepVerificationConfig(CurrentUser.userId),
    retryable: true,
    withCredentials: true
  };
  try {
    const res = await httpService.get<TTwoStepVerificationConfigRes>(urlConfig);
    const isEnabled = (res?.data?.methods || []).some(method => !!method.enabled);
    return isEnabled;
  } catch (err) {
    return false;
  }
};

export const generateTwoStepVerificationToken = async (): Promise<string | null> => {
  const urlConfig = {
    url: postGenerateTwoStepVerificationToken('spend-friction'),
    retryable: true,
    withCredentials: true
  };
  try {
    const res = await httpService.post<string | null | undefined>(urlConfig);
    return res.data || null;
  } catch (err) {
    return null;
  }
};

export const redeemTwoStepVerificationChallenge = async (
  challengeToken: string,
  verificationToken: string
): Promise<boolean> => {
  const urlConfig = {
    url: postRedeemTwoStepVerificationChallenge('spend-friction'),
    retryable: true,
    withCredentials: true
  };
  const params = {
    challengeToken,
    verificationToken
  };
  try {
    const res = await httpService.post<boolean>(urlConfig, params);
    return res.data ?? false;
  } catch (err) {
    return false;
  }
};
