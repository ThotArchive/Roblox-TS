import React from 'react';
import { AnswerChoice } from '../constants/types';
import useSecurityQuestionsContext from '../hooks/useSecurityQuestionsContext';

type Props = {
  setSelected: (selected: boolean) => void;
} & AnswerChoice;

/**
 * A rendered answer choice that can be selected to answer a security question.
 * Takes up one-third of its parent width by default.
 */
const AnswerChoiceView: React.FC<Props> = ({ setSelected, caption, imageUrl, selected }: Props) => {
  const {
    state: { resources }
  } = useSecurityQuestionsContext();
  const classNameForImage = `answer-choice-image${selected ? ' answer-choice-selected' : ''}`;
  const captionComputed = caption || resources.Description.UnknownChoice;

  // Handlers:
  const toggleSelected = () => setSelected(!selected);
  const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    toggleSelected();
    event.currentTarget.blur();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      toggleSelected();
    }
  };

  return (
    <div className='answer-choice'>
      <div
        className={classNameForImage}
        role='checkbox'
        aria-checked={selected}
        onClick={handleOnClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}>
        {imageUrl !== null ? (
          <img src={imageUrl} alt={captionComputed} />
        ) : (
          <div className='answer-choice-img-placeholder'>{captionComputed}</div>
        )}
      </div>
      <div className='answer-choice-caption xsmall'>{captionComputed}</div>
    </div>
  );
};

export default AnswerChoiceView;
