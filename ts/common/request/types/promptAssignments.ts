/**
 * Security Prompt Assignments
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountSecurityServiceUrl = `${apiGatewayUrl}/account-security-service`;

export enum PromptAssignmentsError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  PROMPT_ASSIGNMENT_WAS_NOT_UPDATED = 3,
  UNKNOWN_PROMPT_TYPE = 4
}

export enum DisplayType {
  TEXT_ONLY_BANNER = 'DISPLAY_TYPE_TEXT_ONLY_BANNER'
}

export enum PageRestriction {
  GLOBAL = 'PAGE_RESTRICTION_GLOBAL',
  HOME_PAGE_ONLY = 'PAGE_RESTRICTION_HOME_PAGE'
}

export enum PromptType {
  CHANGE_PASSWORD__SUSPECTED_COMPROMISE = 'PROMPT_TYPE_CHANGE_PASSWORD__SUSPECTED_COMPROMISE',
  CHANGE_PASSWORD__BREACHED_CREDENTIAL = 'PROMPT_TYPE_CHANGE_PASSWORD__BREACHED_CREDENTIAL',
  AUTHENTICATOR_UPSELL = 'PROMPT_TYPE_AUTHENTICATOR_UPSELL',
  ACCOUNT_RESTORES_POLICY_UPDATE = 'PROMPT_TYPE_ACCOUNT_RESTORES_POLICY_UPDATE',
  ACCOUNT_RESTORES_POLICY_UPDATE_V2 = 'PROMPT_TYPE_ACCOUNT_RESTORES_POLICY_UPDATE_V2',
  ACCOUNT_RESTORES_POLICY_UPDATE_V3 = 'PROMPT_TYPE_ACCOUNT_RESTORES_POLICY_UPDATE_V3',
  ACCOUNT_RESTORES_POLICY_UPSELL = 'PROMPT_TYPE_ACCOUNT_RESTORES_POLICY_UPSELL',
  BROADER_AUTHENTICATOR_UPSELL = 'PROMPT_TYPE_BROADER_AUTHENTICATOR_UPSELL',
  EMAIL_2SV_UPSELL = 'PROMPT_TYPE_EMAIL_2SV_UPSELL'
}

export type PromptAssignment =
  | {
      isGeneric?: false;
      promptType: PromptType.CHANGE_PASSWORD__SUSPECTED_COMPROMISE;
      metadata: {};
    }
  | {
      isGeneric?: false;
      promptType: PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL;
      metadata: {
        forceResetTimestamp: string;
      };
    }
  | {
      isGeneric?: false;
      promptType: PromptType.AUTHENTICATOR_UPSELL;
      metadata: {};
    }
  | {
      isGeneric?: false;
      promptType: PromptType.ACCOUNT_RESTORES_POLICY_UPDATE;
      metadata: {
        accountRestoresPolicyEffectiveTimestamp: string;
      };
    }
  | {
      isGeneric?: false;
      promptType: PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2;
      metadata: {};
    }
  | {
      isGeneric?: false;
      promptType: PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3;
      metadata: {};
    }
  | {
      isGeneric?: false;
      promptType: PromptType.ACCOUNT_RESTORES_POLICY_UPSELL;
      metadata: {};
    }
  | {
      isGeneric?: false;
      promptType: PromptType.BROADER_AUTHENTICATOR_UPSELL;
      metadata: {
        showBanner: boolean;
        pageRestriction: PageRestriction;
      };
    }
  | {
      isGeneric?: false;
      promptType: PromptType.EMAIL_2SV_UPSELL;
      metadata: {
        showBanner: boolean;
        pageRestriction: PageRestriction;
        // These are strings because JS doesn't support large integers natively during
        // serialization/deserialization. Plus we're only passing these values around to
        // avoid an extra query in Account Security Service.
        robuxBalance: string;
        tradableItemValue: string;
        controllableGroupRobuxBalance: string;
      };
    }
  | {
      isGeneric: true;
      promptType: string;
      metadata: {
        displayType: DisplayType;
        showXButtonForDisable: boolean;
        showAlertIcon: boolean;
        headerResource: string;
        bodyResource: string;
      };
    };

export type GetAllForCurrentUserReturnType = PromptAssignment[];

/**
 * Request Type: `GET`.
 */
export const GET_ALL_FOR_CURRENT_USER_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSecurityServiceUrl}/v1/prompt-assignments`,
  timeout: 10000
};

export enum UpdateAction {
  DISMISS_PROMPT = 'DISMISS_PROMPT',
  DISABLE_PROMPT = 'DISABLE_PROMPT'
}

export type UpdateForCurrentUserReturnType = void;

/**
 * Request Type: `POST`.
 */
export const UPDATE_FOR_CURRENT_USER_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSecurityServiceUrl}/v1/prompt-assignments`,
  timeout: 10000
};
