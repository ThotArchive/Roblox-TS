export const ModalEvent = {
  MountSearchLanding: 'MountSearchLanding',
  ShowSearchLanding: 'ShowSearchLanding',
  UpdateSearchSessionInfo: 'UpdateSearchSessionInfo'
};

export type ShowSearchLandingEventParams = {
  sessionInfo: string;
};

export type UpdateSearchSessionInfoEventParams = {
  sessionInfo: string;
};

export default { ModalEvent };
