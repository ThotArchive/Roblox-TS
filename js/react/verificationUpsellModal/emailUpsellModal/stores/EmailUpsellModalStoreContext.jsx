import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import { CurrentUser } from 'Roblox';
import {
  SET_USER_EMAIL_STATES,
  SET_PAGENAME_STATE,
  SET_MODAL_STATES,
  SET_INPUT_STATE,
  SET_ERROR_STATE,
  SET_RESEND_EMAIL_STATE,
  SET_EMAIL_SENT_STATE,
  SET_EMAIL_ADDED_STATE,
  SET_EMAIL_UPDATING_STATE,
  SET_TRIGGER_ORIGIN,
  SET_INPUT_CLEAR
} from '../actions/actionTypes';
import verificationUpsellConstants from '../constants/verificationUpsellConstants';
import { verificationUpsellModalLogoutExperimentParameters } from '../../common/constants/urlConstants';

const {
  ActionSendConfirmationEmail,
  ActionResendConfirmationEmail,
  ActionChangeEmail,
  ActionLogoutSkip,
  ActionGenericSkip,
  ActionContinue,
  DescriptionVerifyEmailBody,
  DescriptionAddEmailTextOver13,
  DescriptionAddEmailTextUnder13,
  DescriptionLogoutTextOver13,
  DescriptionLogoutTextUnder13,
  HeadingVerifyEmail,
  HeadingAddEmail,
  HeadingAddEmailHomePage,
  HeadingVerifyOnLogout,
  LabelEmailInputPlaceholderOver13,
  LabelEmailInputPlaceholderUnder13,
  HomePageAddEmailTextOver13,
  HomePageAddEmailTextUnder13
} = verificationUpsellConstants;

const initialState = {
  pageName: '',
  isModalOpen: false,
  isEmailVerified: false,
  isEmailSent: false,
  isEmailUpdating: false,
  isEmailAdded: false,
  origin: '',
  experimentParameters: null,
  userEmail: '',
  userEmailInput: '',
  userEmailInputPlaceholder: LabelEmailInputPlaceholderOver13,
  errorMsg: '',
  titleText: HeadingVerifyEmail,
  bodyText: DescriptionVerifyEmailBody,
  primaryButtonText: ActionResendConfirmationEmail,
  secondaryButtonText: ActionChangeEmail,
  skipCallback: null,
  closeCallback: null
};

const EmailUpsellModalStoreContext = createContext(initialState);

const reducer = (oldState, action) => {
  switch (action.type) {
    // email verification actions
    case SET_INPUT_CLEAR:
      return {
        ...oldState,
        userEmailInput: ''
      };
    case SET_TRIGGER_ORIGIN:
      return {
        ...oldState,
        origin: action.origin,
        skipCallback: action.skipCallback,
        closeCallback: action.closeCallback
      };
    case SET_USER_EMAIL_STATES:
      return {
        ...oldState,
        isEmailVerified: action.isEmailVerified,
        userEmail: action.userEmail
      };
    case SET_PAGENAME_STATE:
      return {
        ...oldState,
        pageName: action.pageName
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
    case SET_EMAIL_SENT_STATE:
      return {
        ...oldState,
        isEmailSent: true
      };
    case SET_EMAIL_ADDED_STATE:
      return { ...oldState, isEmailAdded: true };
    case SET_RESEND_EMAIL_STATE:
      return {
        ...oldState,
        isEmailSent: false
      };
    case SET_INPUT_STATE:
      if (oldState.pageName === verificationUpsellConstants.UpdateEmail) {
        return {
          ...oldState,
          userEmailInput: action.value,
          errorMsg: ''
        };
      }
      return oldState;

    case SET_MODAL_STATES:
      // Set modal states based on pageName and experiment parameter values
      if (oldState.pageName === verificationUpsellConstants.UpdateEmail) {
        // Note that different texts are shown for users under 13.
        const isUserOver13 = CurrentUser && !CurrentUser.isUnder13;
        let primaryText = ActionSendConfirmationEmail;
        let secondaryText = '';
        let bodyString;
        let headingString;

        if (oldState.skipCallback) {
          secondaryText = ActionGenericSkip;
        }
        switch (oldState.origin) {
          case verificationUpsellConstants.Logout:
            headingString = HeadingVerifyOnLogout;
            bodyString = isUserOver13 ? DescriptionLogoutTextOver13 : DescriptionLogoutTextUnder13;
            secondaryText = ActionLogoutSkip;
            if (action.experimentParameters) {
              headingString =
                action.experimentParameters[
                  verificationUpsellModalLogoutExperimentParameters.header
                ] ?? headingString;
              bodyString =
                action.experimentParameters[
                  verificationUpsellModalLogoutExperimentParameters.body
                ] ?? bodyString;
              primaryText =
                action.experimentParameters[
                  verificationUpsellModalLogoutExperimentParameters.primaryButton
                ] ?? primaryText;
              secondaryText =
                action.experimentParameters[
                  verificationUpsellModalLogoutExperimentParameters.secondaryButton
                ] ?? secondaryText;
            }
            break;
          case verificationUpsellConstants.HomePage:
          case verificationUpsellConstants.NotApprovedPage:
            headingString = HeadingAddEmailHomePage;
            bodyString = isUserOver13 ? HomePageAddEmailTextOver13 : HomePageAddEmailTextUnder13;
            primaryText = ActionContinue;
            break;
          default:
            headingString = HeadingAddEmail;
            bodyString = isUserOver13
              ? DescriptionAddEmailTextOver13
              : DescriptionAddEmailTextUnder13;
        }

        return {
          ...oldState,
          pageName: verificationUpsellConstants.UpdateEmail,
          titleText: headingString,
          bodyText: bodyString,
          primaryButtonText: primaryText,
          secondaryButtonText: secondaryText,
          errorMsg: '',
          userEmailInputPlaceholder: isUserOver13
            ? LabelEmailInputPlaceholderOver13
            : LabelEmailInputPlaceholderUnder13
        };
      }
      // oldState.pageName is verificationUpsellConstants.Verification)
      return {
        ...oldState,
        pageName: verificationUpsellConstants.Verification,
        titleText: HeadingVerifyEmail,
        bodyText: DescriptionVerifyEmailBody,
        primaryButtonText: ActionResendConfirmationEmail,
        secondaryButtonText: ActionChangeEmail,
        errorMsg: ''
      };
    default:
      return oldState;
  }
};

const EmailUpsellModalStateProvider = ({ children }) => {
  const [emailUpsellState, dispatch] = useReducer(reducer, initialState);

  return (
    <EmailUpsellModalStoreContext.Provider value={{ emailUpsellState, dispatch }}>
      {children}
    </EmailUpsellModalStoreContext.Provider>
  );
};

EmailUpsellModalStateProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { EmailUpsellModalStoreContext, EmailUpsellModalStateProvider };
