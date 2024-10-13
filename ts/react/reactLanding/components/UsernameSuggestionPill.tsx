import React from 'react';
import { Button } from 'react-style-guide';

interface UsernameSuggestionPillProps {
  usernameSuggestion: string;
  onUsernameClicked: (username: string) => void;
}

const UsernameSuggestionPill: React.FC<UsernameSuggestionPillProps> = ({
  usernameSuggestion,
  onUsernameClicked
}) => {
  return (
    <Button
      className='username-suggestion-pill'
      onClick={() => onUsernameClicked(usernameSuggestion)}>
      {usernameSuggestion}
    </Button>
  );
};

export default UsernameSuggestionPill;
