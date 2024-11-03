import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { RequestService } from '../../common/request';
import { PromptAssignment } from '../../common/request/types/promptAssignments';
import { TRANSLATION_CONFIG } from './app.config';
import AccountSecurityPromptContainer from './containers/accountSecurityPrompt';
import { EventService } from './services/eventService';
import { AccountSecurityPromptContextProvider } from './store/contextProvider';

/**
 * Core parameters provided by the experimentation framework.
 */
type Props = {
  promptAssignment: PromptAssignment;
  username: string;
  isUserUnder13: boolean;
  eventService: EventService;
  requestService: RequestService;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  promptAssignment,
  username,
  isUserUnder13,
  eventService,
  requestService,
  translate
}: Props) => {
  return (
    <AccountSecurityPromptContextProvider
      promptAssignment={promptAssignment}
      username={username}
      isUserUnder13={isUserUnder13}
      eventService={eventService}
      requestService={requestService}
      translate={translate}>
      <AccountSecurityPromptContainer />
    </AccountSecurityPromptContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
