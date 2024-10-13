import React, { createContext, useReducer } from 'react';
import { Button } from 'react-style-guide';
import PropTypes from 'prop-types';
import { CurrentUser, Hybrid, EnvironmentUrls } from 'Roblox';
import { urlService } from 'core-utilities';
import {
  SET_USER_EMAIL_STATES,
  SET_PAGENAME_STATE,
  SET_MODAL_STATES,
  SET_INPUT_STATE,
  SET_ERROR_STATE,
  SET_EMAIL_UPDATING_STATE,
  SET_TRIGGER_ORIGIN,
  SET_INPUT_CLEAR,
  SET_VERIFICATION_CALLBACK,
  SET_CALLBACK_READY,
  CLEANUP_MODAL
} from '../actions/actionTypes';
import emailUpsellConstants from '../constants/emailUpsellConstants';
import { DisplayView, CloseVendorModalEvent } from '../constants/viewConstants';
import events from '../constants/idVerificationEventStreamConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';
import {
  postOptUserInToVoiceChat,
  postOptUserInToAvatarChat,
  sendChatEvent
} from '../services/voiceChatService';

const { websiteUrl } = EnvironmentUrls;

const {
  ActionGenericSkip,
  ActionChangeEmail,
  ActionContinue,
  DescriptionAddEmailTextOver13,
  DescriptionAddEmailTextUnder13,
  HeadingAddEmail,
  LabelEmailInputPlaceholderOver13,
  LabelEmailInputPlaceholderUnder13
} = emailUpsellConstants;

const initialState = {
  pageName: DisplayView.PENDING,
  isEmailVerified: false,
  isEmailSent: false,
  isEmailUpdating: false,
  origin: '',
  userEmail: '',
  userEmailInput: '',
  userEmailInputPlaceholder: LabelEmailInputPlaceholderOver13,
  errorMsg: '',
  titleText: HeadingAddEmail,
  bodyText: DescriptionAddEmailTextOver13,
  primaryButtonText: ActionContinue,
  secondaryButtonText: ActionChangeEmail,
  daysUntilNextVerification: 0,
  skipCallback: null,
  pageState: null,
  closeCallback: null,
  callbackReady: false
};

const IdVerificationStoreContext = createContext(initialState);

function fireCloseEvent(overage, verified) {
  // hybrid bridge for lua
  if (Hybrid && Hybrid.Navigation) {
    Hybrid.Navigation.navigateToFeature({
      feature: CloseVendorModalEvent,
      overage,
      verified
    });
  }
}

const idVerificationReducer = (oldState, action) => {
  let pageState = null;
  switch (action.type) {
    case SET_INPUT_CLEAR:
      return {
        ...oldState,
        userEmailInput: ''
      };
    case SET_TRIGGER_ORIGIN:
      return {
        ...oldState,
        origin: action.origin,
        skipCallback: action.skipCallback
      };
    case SET_USER_EMAIL_STATES:
      return {
        ...oldState,
        isEmailVerified: action.isEmailVerified,
        userEmail: action.userEmail
      };
    case SET_PAGENAME_STATE:
      if (action.pageName === DisplayView.SUCCESS_OVERAGE) {
        pageState = {
          heading: 'Heading.ThankYou',
          icon: 'success-icon',
          bodyText: ['Label.OverageVerification', 'Label.VoiceChat'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.OK',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.SUCCESS_UNDERAGE) {
        pageState = {
          heading: 'Heading.ThankYou',
          icon: 'success-icon',
          bodyText: ['Label.UnderageVerification', 'Label.VoiceChat'],
          footerText: 'Label.ToggleFeatures',
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Close',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.SUCCESS_GENERIC) {
        sendIdVerificationEvent(events.successPage, {
          origin: oldState.origin
        });

        const bodyText = ['Label.DateOfBirthUpdated'];

        if (action.isSeventeenPlus) {
          bodyText.push('Label.AccessWiderVariety');
        }

        pageState = {
          heading: 'Heading.VerificationSuccessful',
          bodyText,
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Close',
              callback: () => {
                sendIdVerificationEvent(events.successPageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.EXTERNAL_EMAIL) {
        pageState = {
          heading: 'Heading.VerifyEmail',
          icon: 'shield-icon',
          bodyText: ['Label.EmailSent'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.dispatch({
                  type: SET_PAGENAME_STATE,
                  pageName: DisplayView.POLLING
                });
                action.poll();
              }
            }
          ],
          userEmail: oldState.userEmail
        };
      } else if (action.pageName === DisplayView.EMAIL_CONTINUE) {
        pageState = {
          heading: 'Heading.VerificationPending',
          icon: 'shield-icon',
          bodyText: ['Label.EmailSent'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.dispatch({
                  type: SET_PAGENAME_STATE,
                  pageName: DisplayView.POLLING
                });
                action.poll();
              }
            }
          ],
          userEmail: oldState.userEmail
        };
      } else if (action.pageName === DisplayView.POLLING) {
        pageState = {
          ...action
        };
      } else if (action.pageName === DisplayView.PENDING) {
        pageState = {
          heading: 'Heading.VerificationPending',
          icon: 'failure-icon',
          bodyText: ['Label.PendingVerification'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Close',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.FAILURE) {
        sendIdVerificationEvent(events.failurePage, {
          origin: oldState.origin
        });
        pageState = {
          heading: 'Heading.VerificationFailed',
          icon: 'failure-icon',
          bodyText: [action.textKey || 'Label.FailedVerification'],
          errorState: true,
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.Close',
              callback: () => {
                sendIdVerificationEvent(events.failurePageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.LANDING) {
        pageState = {
          heading: 'Heading.VerifyAge',
          icon: 'shield-icon',
          bodyText: ['Label.VoiceChatUpsell'],
          buttonStack: [
            {
              text: 'Action.SkipVoiceChat',
              callback: () => {
                action.dispatch({ type: CLEANUP_MODAL });
              }
            },
            {
              variant: Button.variants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.continue();
              }
            }
          ],
          userEmail: oldState.userEmail,
          displayCheckbox: true
        };
      } else if (action.pageName === DisplayView.ERROR) {
        pageState = {
          heading: 'Heading.Error',
          icon: 'failure-icon',
          bodyText: ['Label.GenericError'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.OK',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.TEMP_BAN) {
        sendIdVerificationEvent(events.tempBanPage, {
          origin: oldState.origin
        });
        pageState = {
          heading: 'Heading.Error',
          icon: 'failure-icon',
          bodyText: ['Label.VerificationDeclined'],
          buttonStack: [
            {
              variant: Button.variants.primary,
              text: 'Action.OK',
              callback: () => {
                sendIdVerificationEvent(events.tempBanPageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          daysUntilNextVerification: action.daysUntilNextVerification,
          canClose: false
        };
      } else if (action.pageName === DisplayView.VENDOR_LINK) {
        if (action.useQRCode) {
          sendIdVerificationEvent(events.showQRCode, {
            origin: oldState.origin
          });
        }
        pageState = {
          verificationLink: action.verificationLink,
          useQRCode: action.useQRCode,
          origin: oldState.origin,
          redirectUrl: action.redirectUrl
        };
      } else if (action.pageName === DisplayView.ENABLE_VOICE_CHAT) {
        pageState = {
          communityStandardsUrl: urlService.resolveUrl(websiteUrl, '/info/community-guidelines'),
          voiceFAQUrl: urlService.resolveUrl(websiteUrl, '/info/voice-faq'),
          requireExplicitVoiceConsent: action.requireExplicitVoiceConsent,
          useVoiceUpsellV2Design: action.useVoiceUpsellV2Design,
          voiceUpsellV1Keys: {
            heading: 'Heading.LetsChat',
            enableVoiceChat: 'Label.EnableVoiceChat1',
            followCommunityStandards: 'Label.FollowCommunityStandards',
            implicitConsent: 'Label.ImplicitConsentVoiceCollectionWithML',
            explicitConsent: 'Label.ExplicitConsentVoiceCollectionWithML',
            learnMoreAboutVoiceRecording: 'Label.LearnMoreAboutVoiceRecording',
            buttonStack: [
              {
                explicitDisable: false,
                variant: Button.variants.secondary,
                text: 'Action.SkipVoiceChat',
                callback: () => {
                  sendChatEvent(events.joinWithoutVoiceChat);
                  action.close();
                }
              },
              {
                explicitDisable: true,
                variant: Button.variants.primary,
                text: 'Label.EnableVoiceChat',
                callback: () => {
                  postOptUserInToVoiceChat(true, true);
                  action.close();
                }
              }
            ]
          },
          voiceUpsellV2Keys: {
            heading: 'Heading.V2LetsChat',
            enableVoiceChat: 'Label.V2EnableVoiceChat1',
            followCommunityStandards: 'Label.FollowCommunityStandards',
            implicitConsent: 'Label.V2ClickToConsent',
            explicitConsent: 'Label.V2ClickToConsent',
            learnMoreAboutVoiceRecording: 'Label.LearnMoreAboutVoiceRecording',
            buttonStack: [
              {
                explicitDisable: true,
                variant: Button.variants.primary,
                text: 'Label.V2EnableVoiceChat',
                callback: () => {
                  sendChatEvent(events.enableVoiceChatUpsell);
                  postOptUserInToVoiceChat(true, true);
                  action.close();
                }
              },
              {
                explicitDisable: false,
                variant: Button.variants.secondary,
                text: 'Label.V2JoinWithout',
                callback: () => {
                  sendChatEvent(events.joinWithoutVoiceChat);
                  action.close();
                }
              }
            ]
          }
        };
      } else if (action.pageName === DisplayView.ENABLE_AVATAR_CHAT) {
        pageState = {
          title: 'Title.CameraUpsell',
          animateYourAvatar: 'Description.CameraUpsell',
          communityStandards: 'Description.CommunityStandardsUpsell',
          cameraPrivacy: 'Description.CameraPrivacy',
          implicitConsent: 'Description.DefaultConsentCameraUpsell',
          explicitConsent: 'Description.ExplicitConsentCameraUpsell',
          learnMore: 'Label.CameraLearnMoreUpsell',
          facialPrivacyUrl: urlService.resolveUrl(websiteUrl, '/info/facial-animation-privacy'),
          requireExplicitCameraConsent: action.requireExplicitCameraConsent,
          useCameraU13Design: action.useCameraU13Design,
          buttons: [
            {
              text: 'Label.EnableCameraUpsell',
              explicitDisable: true,
              callback: () => {
                postOptUserInToAvatarChat(true, true);
                sendChatEvent(events.enableAvatarVideo);
                action.close();
              }
            },
            {
              text: 'Label.JoinWithoutCameraUpsell',
              explicitDisable: false,
              callback: () => {
                sendChatEvent(events.joinWithoutAvatarVideo);
                action.close();
              }
            }
          ]
        };
      }
      return {
        ...oldState,
        pageName: action.pageName,
        pageState
      };
    case SET_ERROR_STATE:
      return {
        ...oldState,
        errorMsg: action.errorMsg
      };
    case SET_EMAIL_UPDATING_STATE:
      return {
        ...oldState,
        isEmailUpdating: action.isEmailUpdating
      };
    case SET_INPUT_STATE:
      if (oldState.pageName === DisplayView.EMAIL) {
        return {
          ...oldState,
          userEmailInput: action.value,
          errorMsg: ''
        };
      }

      return oldState;
    case SET_MODAL_STATES:
      // Set modal states based on pageName
      if (oldState.pageName === DisplayView.EMAIL) {
        // Note that different texts are shown for users under 13.
        const isUserOver13 = CurrentUser && !CurrentUser.isUnder13;
        const over13String = DescriptionAddEmailTextOver13;
        const under13String = DescriptionAddEmailTextUnder13;
        const headingString = HeadingAddEmail;
        let secondaryText = '';
        if (oldState.skipCallback) {
          secondaryText = ActionGenericSkip;
        }

        return {
          ...oldState,
          titleText: headingString,
          bodyText: isUserOver13 ? over13String : under13String,
          primaryButtonText: ActionContinue,
          secondaryButtonText: secondaryText,
          errorMsg: '',
          userEmailInputPlaceholder: isUserOver13
            ? LabelEmailInputPlaceholderOver13
            : LabelEmailInputPlaceholderUnder13
        };
      }
      return oldState;
    case SET_VERIFICATION_CALLBACK:
      return {
        ...oldState,
        closeCallback: action.callback,
        callbackReady: true
      };
    case SET_CALLBACK_READY:
      return {
        ...oldState,
        callbackReady: true
      };
    case CLEANUP_MODAL:
      if (oldState.callbackReady) {
        const isUserOldEnough =
          oldState.pageName === DisplayView.SUCCESS_GENERIC ||
          oldState.pageName === DisplayView.SUCCESS_OVERAGE;
        const didVerifyAge = isUserOldEnough || oldState.pageName === DisplayView.SUCCESS_UNDERAGE;
        fireCloseEvent(isUserOldEnough, didVerifyAge);
        if (oldState.closeCallback) {
          oldState.closeCallback(isUserOldEnough, didVerifyAge);
        }
      }
      return {
        ...initialState
      };
    default:
      return oldState;
  }
};

const IdVerificationStateProvider = ({ children }) => {
  const [idVerificationState, dispatch] = useReducer(idVerificationReducer, initialState);

  return (
    <IdVerificationStoreContext.Provider value={{ idVerificationState, dispatch }}>
      {children}
    </IdVerificationStoreContext.Provider>
  );
};

IdVerificationStateProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { IdVerificationStoreContext, IdVerificationStateProvider };
