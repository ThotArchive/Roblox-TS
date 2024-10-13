import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as SecurityQuestions from '../types/securityQuestions';

export const getQuestion = (
  userId: string,
  sessionId: string
): Promise<
  Result<SecurityQuestions.GetQuestionReturnType, SecurityQuestions.SecurityQuestionsError | null>
> =>
  toResult(
    httpService.get(SecurityQuestions.GET_QUESTION_CONFIG, { userId, sessionId }),
    SecurityQuestions.SecurityQuestionsError
  );

export const answerQuestion = (
  userId: string,
  answerChoices: string[],
  sessionId: string
): Promise<
  Result<
    SecurityQuestions.AnswerQuestionReturnType,
    SecurityQuestions.SecurityQuestionsError | null
  >
> =>
  toResult(
    httpService.post(SecurityQuestions.ANSWER_QUESTION_CONFIG, {
      userId,
      answer: answerChoices,
      sessionId
    }),
    SecurityQuestions.SecurityQuestionsError
  );
