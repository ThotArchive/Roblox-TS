/* eslint-disable react/jsx-no-literals */
import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import UsernameSuggestionPill from './UsernameSuggestionPill';
import { postUsernameSuggestions } from '../services/signupService';
import {
  TPostUsernameSuggestionsParams,
  TPostUsernameSuggestionsResponse
} from '../../common/types/signupTypes';
import { signupFormStrings } from '../constants/signupConstants';
import {
  sendAuthButtonClickEvent,
  sendUsernameSuggestionShownEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

interface UsernameSuggestionContainerProps {
  inputUsername: string;
  birthday: Date;
  onUsernameClicked: (username: string) => void;
  translate: WithTranslationsProps['translate'];
}

const UsernameSuggestionContainer: React.FC<UsernameSuggestionContainerProps> = ({
  inputUsername,
  birthday,
  onUsernameClicked,
  translate
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const params: TPostUsernameSuggestionsParams = {
        Username: inputUsername,
        Birthday: birthday
      };
      const response: TPostUsernameSuggestionsResponse = await postUsernameSuggestions(params);
      if (
        response.didGenerateNewUsername &&
        response.suggestedUsernames.length > 0 &&
        response.suggestedUsernames !== suggestions
      ) {
        setSuggestions(response.suggestedUsernames);
        const suggestionCsv = response.suggestedUsernames.join(',');
        sendUsernameSuggestionShownEvent(inputUsername, suggestionCsv);
      }
    };
    fetchSuggestions().catch(e => {
      setSuggestions([]); // clear suggestions on error
    });
  }, [inputUsername]);

  function handleUsernameClick(username: string) {
    onUsernameClicked(username);
    sendAuthButtonClickEvent(
      EVENT_CONSTANTS.btn.usernameSuggestion,
      username,
      EVENT_CONSTANTS.context.signupForm
    );
  }

  if (suggestions.length === 0) {
    // early return if no suggestions
    return <div />;
  }

  return (
    <div className='username-suggestion-container'>
      <div className='username-suggestion-label font-caption-header'>
        {`${translate(signupFormStrings.Try)}:`}
      </div>
      <div className='username-suggestion-pill-container'>
        {suggestions.map((suggestion, _) => (
          <UsernameSuggestionPill
            key={suggestion}
            usernameSuggestion={suggestion}
            onUsernameClicked={() => handleUsernameClick(suggestion)}
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslations(UsernameSuggestionContainer, signupTranslationConfig);
