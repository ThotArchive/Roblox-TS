type TConfig = {
  common: string[];
  feature: string;
};

export const accountSwitcherConfig: TConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Authentication.AccountSwitch'
};

export default {
  accountSwitcherConfig
};
