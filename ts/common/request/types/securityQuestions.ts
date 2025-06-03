/**
 * Security Questions
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountSecurityServiceUrl = `${apiGatewayUrl}/account-security-service`;

export enum SecurityQuestionsError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  SECURITY_QUESTIONS_DISABLED = 3,
  SESSION_INACTIVE = 4,
  QUESTION_NOT_FOUND = 5,
  ANSWER_WRONG_FORMAT = 6
}

export enum QuestionType {
  INVALID = 0,
  MOST_RECENT_GAMES_PLAYED = 1
}

export enum AnswerPrompt {
  PICK_ALL_CORRECT_CHOICES = 0,
  PICK_C_CORRECT_CHOICES = 1
}

export type AnswerPromptWithData =
  | {
      answerPrompt: AnswerPrompt.PICK_ALL_CORRECT_CHOICES;
    }
  | {
      answerPrompt: AnswerPrompt.PICK_C_CORRECT_CHOICES;
      correctAnswerChoiceCount: number;
    };

export type GetQuestionReturnType = {
  questionType: QuestionType;
  answerChoices: string[];
} & AnswerPromptWithData;

/**
 * Request Type: `GET`.
 */
export const GET_QUESTION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSecurityServiceUrl}/v1/security-question`,
  timeout: 10000
};

export type AnswerQuestionReturnTypeSessionSolved = {
  answerCorrect: true;
  shouldRequestNewQuestion: false;
  redemptionToken: string;
};

export type AnswerQuestionReturnTypeSessionContinued = {
  answerCorrect: false;
  shouldRequestNewQuestion: true;
};

export type AnswerQuestionReturnTypeSessionFailed = {
  answerCorrect: false;
  shouldRequestNewQuestion: false;
  /** This is almost always true, though we should handle reset failures. */
  userWasForceReset: boolean;
};

export type AnswerQuestionReturnType =
  | AnswerQuestionReturnTypeSessionSolved
  | AnswerQuestionReturnTypeSessionContinued
  | AnswerQuestionReturnTypeSessionFailed;

/**
 * Request Type: `POST`.
 */
export const ANSWER_QUESTION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountSecurityServiceUrl}/v1/security-question`,
  timeout: 10000
};
