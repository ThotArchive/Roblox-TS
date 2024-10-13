import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as PromptAssignments from '../types/promptAssignments';
import { DisplayType, PromptType } from '../types/promptAssignments';

export const getAllForCurrentUser = async (): Promise<
  Result<
    PromptAssignments.GetAllForCurrentUserReturnType,
    PromptAssignments.PromptAssignmentsError | null
  >
> => {
  let result: Result<
    PromptAssignments.GetAllForCurrentUserReturnType,
    PromptAssignments.PromptAssignmentsError | null
  > = await toResult(
    httpService.get(PromptAssignments.GET_ALL_FOR_CURRENT_USER_CONFIG, {
      shouldReturnMetadata: true
    }),
    PromptAssignments.PromptAssignmentsError
  );
  if (result.isError) {
    return result;
  }

  // Filter prompt types that are not explicitly part of the return value enums
  // we've defined (this is basically a minor validation to ignore prompt types
  // on the back-end that are still in development).
  result = {
    ...result,
    value: result.value.filter(value =>
      value.isGeneric
        ? // For generic prompts, we don't necessarily need to know their prompt
          // types as long as we are given information on how to display them.
          Object.values(DisplayType).includes(value.metadata.displayType)
        : Object.values(PromptType).includes(value.promptType)
    )
  };

  return result;
};

export const updateForCurrentUser = (
  action: PromptAssignments.UpdateAction,
  promptType: string
): Promise<
  Result<
    PromptAssignments.UpdateForCurrentUserReturnType,
    PromptAssignments.PromptAssignmentsError | null
  >
> => {
  return toResult(
    httpService.post(PromptAssignments.UPDATE_FOR_CURRENT_USER_CONFIG, {
      action,
      promptType
    }),
    PromptAssignments.PromptAssignmentsError
  );
};
