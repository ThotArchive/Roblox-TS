import React, { Fragment, useState } from 'react';
import * as PromptAssignments from '../../../common/request/types/promptAssignments';
import { DisplayType, PromptType } from '../../../common/request/types/promptAssignments';
import {
  ACCOUNT_SETTINGS_SECURITY_PATH,
  AUTH_REDIRECT_URL_SIGNIFIER,
  CHANGE_PASSWORD_BANNER_SUPPORT_URL,
  EMAIL_HIGHLIGHT_REDIRECT_URL_SIGNIFIER,
  LOG_PREFIX,
  TWO_STEP_SUPPORT_URL
} from '../app.config';
import useAccountSecurityPromptContext from '../hooks/useAccountSecurityPromptContext';
import { AccountSecurityPromptActionType } from '../store/action';
import ModalState from '../store/modalState';
import { getDaysRemainingToForceReset } from './commonHelpers';

/**
 * The banner component for both prompt types.
 */
const BannerAccountSecurity: React.FC = () => {
  const {
    state: { promptAssignment, resources, requestService },
    dispatch
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const dismissForever = async (): Promise<void> => {
    setRequestInFlight(true);
    const result = await requestService.promptAssignments.updateForCurrentUser(
      PromptAssignments.UpdateAction.DISABLE_PROMPT,
      promptAssignment.promptType
    );
    if (result.isError) {
      setRequestInFlight(false);
      // eslint-disable-next-line no-console
      console.warn(
        LOG_PREFIX,
        'Disabling prompt failed with error',
        result.error && PromptAssignments.PromptAssignmentsError[result.error]
      );
    }
    dispatch({ type: AccountSecurityPromptActionType.DISMISS_FOREVER });
  };

  const dismissTemporary = async (): Promise<void> => {
    setRequestInFlight(true);
    const result = await requestService.promptAssignments.updateForCurrentUser(
      PromptAssignments.UpdateAction.DISMISS_PROMPT,
      promptAssignment.promptType
    );
    if (result.isError) {
      setRequestInFlight(false);
      // eslint-disable-next-line no-console
      console.warn(
        LOG_PREFIX,
        'Dismissing prompt failed with error',
        result.error && PromptAssignments.PromptAssignmentsError[result.error]
      );
    }
    dispatch({ type: AccountSecurityPromptActionType.DISMISS_TEMPORARY });
  };

  const startDismissForever = (): void => {
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_DISMISS_CONFIRMATION
    });
  };

  const dismissAccordingToPromptType = async (): Promise<void> => {
    if (
      promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE ||
      promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2 ||
      promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3 ||
      (promptAssignment.isGeneric &&
        promptAssignment.metadata.displayType === DisplayType.TEXT_ONLY_BANNER)
    ) {
      await dismissForever();
    } else {
      await dismissTemporary();
    }
  };

  const handleBannerButtonClick = async () => {
    if (
      promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE ||
      promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2
    ) {
      await dismissForever();
      // The `_self` target opens the redirect URL in the current page.
      window.open(ACCOUNT_SETTINGS_SECURITY_PATH + AUTH_REDIRECT_URL_SIGNIFIER, '_self');
    } else if (promptAssignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL) {
      dispatch({
        type: AccountSecurityPromptActionType.SET_MODAL_STATE,
        modalState: ModalState.AUTHENTICATOR_UPSELL_OPENING
      });
    } else if (promptAssignment.promptType === PromptType.EMAIL_2SV_UPSELL) {
      window.open(ACCOUNT_SETTINGS_SECURITY_PATH + EMAIL_HIGHLIGHT_REDIRECT_URL_SIGNIFIER, '_self');
    } else {
      dispatch({
        type: AccountSecurityPromptActionType.SET_MODAL_STATE,
        modalState: ModalState.CHANGE_PASSWORD_INTRO
      });
    }
  };

  /*
   * Render Properties
   */

  // Compute banner buttons and iconography:
  const showUpsellIcon = [
    PromptType.BROADER_AUTHENTICATOR_UPSELL.toString(),
    PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3.toString(),
    PromptType.EMAIL_2SV_UPSELL.toString()
  ].includes(promptAssignment.promptType.toString());
  let showAlertIcon = !showUpsellIcon;
  let showPrimaryButton =
    PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3 !== promptAssignment.promptType;
  let showSecondaryButton =
    PromptType.CHANGE_PASSWORD__SUSPECTED_COMPROMISE === promptAssignment.promptType;
  let showDismissButton = [
    PromptType.CHANGE_PASSWORD__SUSPECTED_COMPROMISE.toString(),
    PromptType.ACCOUNT_RESTORES_POLICY_UPDATE.toString(),
    PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2.toString(),
    PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3.toString(),
    PromptType.BROADER_AUTHENTICATOR_UPSELL.toString(),
    PromptType.EMAIL_2SV_UPSELL.toString()
  ].includes(promptAssignment.promptType.toString());

  // Override buttons and iconography for generic prompt types.
  if (promptAssignment.isGeneric) {
    showAlertIcon = promptAssignment.metadata.showAlertIcon;
    // This could be dynamic in the future based on `displayType` if we decide
    // to support buttons in the generic message.
    showPrimaryButton = false;
    showSecondaryButton = false;
    showDismissButton = promptAssignment.metadata.showXButtonForDisable;
  }

  // Compute text for banner buttons:
  let bannerButtonText = resources.Action.SubmitChangePassword;
  if (
    promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE ||
    promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2
  ) {
    bannerButtonText = resources.Action.AccountRestoreOpenSettings;
  } else if (promptAssignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL) {
    bannerButtonText = resources.Action.SetUpAuthenticatorInBanner;
  } else if (promptAssignment.promptType === PromptType.EMAIL_2SV_UPSELL) {
    bannerButtonText = resources.Action.SetUpEmail2SV;
  }

  // Compute banner header:
  let bannerHeader: string;
  if (promptAssignment.isGeneric) {
    switch (promptAssignment.metadata.displayType) {
      case DisplayType.TEXT_ONLY_BANNER: {
        bannerHeader = resources.Description.GenericTextOnlyBanner(
          promptAssignment.metadata.headerResource
        );
        break;
      }
      // Should not be possible.
      default: {
        bannerHeader = '';
      }
    }
  } else {
    switch (promptAssignment.promptType) {
      case PromptType.CHANGE_PASSWORD__SUSPECTED_COMPROMISE: {
        bannerHeader = resources.Header.UnusualActivityDetected;
        break;
      }
      case PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL: {
        bannerHeader = resources.Header.YourPasswordMightBeStolen;
        break;
      }
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE: {
        bannerHeader = resources.Header.AccountRestoresPolicyUpdate;
        break;
      }
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2: {
        bannerHeader = resources.Header.KeepYourAccountSafeLong;
        break;
      }
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3: {
        bannerHeader = resources.Header.AccountRestoresPolicyUpdateV3;
        break;
      }
      case PromptType.BROADER_AUTHENTICATOR_UPSELL: {
        bannerHeader = resources.Header.BoostYourAccountSecurity;
        break;
      }
      case PromptType.EMAIL_2SV_UPSELL: {
        bannerHeader = resources.Header.Email2SVUpsell;
        break;
      }
      // Should not be possible.
      default: {
        bannerHeader = '';
      }
    }
  }

  // IMPORTANT: Do not inject user input into this variable; this content is
  // rendered as HTML.
  let bannerDescription: string;

  // Compute banner body:
  if (promptAssignment.isGeneric) {
    switch (promptAssignment.metadata.displayType) {
      case DisplayType.TEXT_ONLY_BANNER: {
        bannerDescription = resources.Header.GenericTextOnlyBanner(
          promptAssignment.metadata.bodyResource
        );
        break;
      }
      // Should not be possible.
      default: {
        bannerDescription = '';
      }
    }
  } else {
    switch (promptAssignment.promptType) {
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE: {
        const accountRestoresDate = new Date(
          promptAssignment.metadata.accountRestoresPolicyEffectiveTimestamp
        );
        // Produces Jan 20, 2022 format. This link provides some context:
        // https://medium.com/swlh/use-tolocaledatestring-to-format-javascript-dates-2959108ea020
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' } as const;
        // `undefined` uses the browser language, which is what we want.
        const accountRestoresDateDescription = accountRestoresDate.toLocaleDateString(
          undefined,
          dateOptions
        );
        bannerDescription = `${resources.Description.AccountRestoresPolicyWithDate(
          accountRestoresDateDescription
        )} ${resources.Description.AuthenticatorSetupPrompt(TWO_STEP_SUPPORT_URL)}`;
        break;
      }
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V2: {
        bannerDescription = resources.Description.AuthenticatorSetupPromptNew(TWO_STEP_SUPPORT_URL);
        break;
      }
      case PromptType.ACCOUNT_RESTORES_POLICY_UPDATE_V3: {
        bannerDescription = resources.Description.AccountRestoresPolicyUpdateV3(
          ACCOUNT_SETTINGS_SECURITY_PATH
        );
        break;
      }
      case PromptType.CHANGE_PASSWORD__SUSPECTED_COMPROMISE: {
        bannerDescription = `${resources.Description.UnusualActivity} ${resources.Description.ChangeYourPassword}`;
        break;
      }
      case PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL: {
        bannerDescription = `${
          resources.Description.ChangeYourPasswordImmediately
        } ${resources.Description.NoChangeForceReset(
          getDaysRemainingToForceReset(promptAssignment.metadata.forceResetTimestamp)
        )} ${resources.Description.LearnMoreHere(CHANGE_PASSWORD_BANNER_SUPPORT_URL)}`;
        break;
      }
      case PromptType.BROADER_AUTHENTICATOR_UPSELL: {
        bannerDescription = resources.Description.ReceiveSecurityCodesMessage;
        break;
      }
      case PromptType.EMAIL_2SV_UPSELL: {
        bannerDescription = resources.Description.Email2SVUpsellMessageBody(
          ACCOUNT_SETTINGS_SECURITY_PATH
        );
        break;
      }
      // Should not be possible.
      default: {
        bannerDescription = '';
      }
    }
  }

  // Now that translations are purely statically bundled this is actually possible if someone
  // tries to return a generic prompt that is missing a translation resource.
  if (bannerHeader === '' || bannerDescription === '') {
    return <React.Fragment />;
  }

  /*
   * Component Markup
   */

  return (
    <div className='security-banner-wrapper'>
      <div className='security-banner'>
        <div className='banner-start'>
          {showAlertIcon && (
            <div className='banner-icon'>
              <div className='icon-warning' />
            </div>
          )}
          {showUpsellIcon && <div className='banner-icon-lock' />}
          <div className='banner-content'>
            <h2 className='banner-header'>{bannerHeader}</h2>
            <div
              className='banner-description'
              // We need to do this since the translated text injects tags.
              // There should be no vulnerability since we control the
              // translated text.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: bannerDescription }}
            />
          </div>
          {showDismissButton && (
            <button
              type='button'
              className='close banner-close'
              aria-label={resources.Action.RemindMeLater}
              onClick={dismissTemporary}>
              <span className='icon-close' />
            </button>
          )}
        </div>
        <div className='banner-buttons'>
          {showSecondaryButton && (
            <span className='banner-button'>
              <button
                type='button'
                className='btn-secondary-md'
                aria-label={resources.Action.DismissForever}
                onClick={startDismissForever}
                disabled={requestInFlight}>
                {resources.Action.DismissForever}
              </button>
            </span>
          )}
          {showPrimaryButton && (
            <span className='banner-button banner-button-last'>
              <button
                type='button'
                className='btn-cta-md'
                aria-label={bannerButtonText}
                onClick={handleBannerButtonClick}
                disabled={requestInFlight}>
                {bannerButtonText}
              </button>
            </span>
          )}
          {showDismissButton && (
            <Fragment>
              {requestInFlight ? (
                <span className='banner-close icon-close spinner-circle' />
              ) : (
                <button
                  type='button'
                  className='close banner-close'
                  aria-label={resources.Action.RemindMeLater}
                  onClick={dismissAccordingToPromptType}>
                  <span className='icon-close' />
                </button>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerAccountSecurity;
