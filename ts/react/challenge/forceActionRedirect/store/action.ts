export enum ForceActionRedirectActionType {
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE
}

export type ForceActionRedirectAction =
  | {
      type: ForceActionRedirectActionType.HIDE_MODAL_CHALLENGE;
    }
  | {
      type: ForceActionRedirectActionType.SHOW_MODAL_CHALLENGE;
    };
