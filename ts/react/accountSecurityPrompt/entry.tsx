import Roblox, { CurrentUser, DeviceMeta } from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import '../../../css/accountSecurityPrompt/accountSecurityPrompt.scss';
import '../../../css/accountSecurityPrompt/banner.scss';
import '../../../css/common/highlight.scss';
import '../../../css/common/modalModern.scss';
import '../../../css/common/spinner.scss';
import { RequestServiceDefault } from '../../common/request';
import * as PromptAssignments from '../../common/request/types/promptAssignments';
import { PromptAssignment, PromptType } from '../../common/request/types/promptAssignments';
import App from './App';
import {
  ACCOUNT_SETTINGS_URL_FRAGMENT,
  AUTH_REDIRECT_URL_SIGNIFIER,
  HOME_PAGE_URL_FRAGMENT,
  LOG_PREFIX,
  ROOT_ELEMENT_ID,
  TRANSLATION_CONFIG
} from './app.config';
import { EventServiceDefault } from './services/eventService';

// Global instance since we do not need prompt parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

/**
 * Renders the account security prompt for a given set of parameters.
 */
const renderApp = (
  promptAssignment: PromptAssignment,
  username: string,
  isUserUnder13: boolean
) => {
  const rootElement = document.getElementById(ROOT_ELEMENT_ID);
  if (rootElement !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault(promptAssignment.promptType);

    // Render the app on the selected element.
    render(
      <App
        promptAssignment={promptAssignment}
        username={username}
        isUserUnder13={isUserUnder13}
        eventService={eventService}
        requestService={requestServiceDefault}
      />,
      rootElement
    );
  }
};

/**
 * Retrieves assignments and renders an account security prompt (based on the
 * currently authenticated user).
 */
const retrieveAndRenderPrompt = async (): Promise<void> => {
  const result = await requestServiceDefault.promptAssignments.getAllForCurrentUser();
  if (result.isError) {
    // eslint-disable-next-line no-console
    console.warn(
      LOG_PREFIX,
      'Retrieving prompt assignments failed with error',
      result.error && PromptAssignments.PromptAssignmentsError[result.error]
    );
    return;
  }

  const assignments = result.value;
  if (assignments.length === 0) {
    // eslint-disable-next-line no-console
    console.log(LOG_PREFIX, 'No assignments were retrieved');
    return;
  }

  // If the user was redirected to this page by a prompt then we don't want
  // another prompt.
  if (
    window.location.href.includes(AUTH_REDIRECT_URL_SIGNIFIER) ||
    window.location.href.includes(ACCOUNT_SETTINGS_URL_FRAGMENT)
  ) {
    return;
  }

  let promptAssignment = null;

  // Goes over the assignments and returns once it finds a valid one in the current page.
  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    // We'll only open Broader Authenticator Upsell if we're on the home page.
    if (
      (assignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL ||
        assignment.promptType === PromptType.EMAIL_2SV_UPSELL) &&
      assignment.isGeneric === false &&
      assignment.metadata.pageRestriction === PromptAssignments.PageRestriction.HOME_PAGE_ONLY &&
      !window.location.href.includes(HOME_PAGE_URL_FRAGMENT)
    ) {
      promptAssignment = null;
    } else {
      promptAssignment = assignment;
      // Found a valid prompt assignment so breaking.
      break;
    }
  }

  if (promptAssignment === null) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  renderApp(promptAssignment, CurrentUser.name, CurrentUser.isUnder13);
};

// Sanity-check that the current user is authenticated and not accessing the
// website using an app-based web view (even to render prompts manually via the
// JavaScript console).
if (CurrentUser && CurrentUser.isAuthenticated && DeviceMeta().appType === 'unknown') {
  // Add some variables to the global `Roblox` object for manual testing via the
  // JavaScript console.
  Object.assign(Roblox, {
    AccountSecurityPrompt: {
      render: renderApp,
      PromptType
    }
  });
  // eslint-disable-next-line no-void
  void retrieveAndRenderPrompt();
}
