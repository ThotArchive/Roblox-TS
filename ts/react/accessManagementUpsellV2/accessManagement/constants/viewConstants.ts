import { Access } from '../../enums';
import { ExtraParameter } from '../../types/AmpTypes';

export const ModalEvent = {
  StartAccessManagementUpsell: 'StartAccessManagementUpsell'
};

export type AccessManagementUpsellEventParams = {
  featureName: string;
  redirectLink: string;
  ampFeatureCheckData: ExtraParameter[];
  isAsyncCall: boolean;
  usePrologue: boolean;
  ampRecourseData: any;
  closeCallback: (access: Access) => string;
};

export const PrologueConstants = {
  Action: {
    Cancel: 'Action.Cancel',
    EmailMyParent: 'Action.EmailMyParent',
    VerifyID: 'Action.VerifyID',
    AskNow: 'Action.AskNow'
  },
  Title: {
    AskYourParent: 'Title.AskYourParent',
    VerifyYourAge: 'Title.VerifyYourAge'
  },
  Description: {
    Vpc: 'Description.PrologueTextVpc',
    VpcConnectingText: 'Description.PrologueConnectingTextVpc',
    Idv: 'Description.PrologueTextIdv',
    IdvConnectingText: 'Description.PrologueConnectingTextIdv',
    IdvAndVpc: 'Description.PrologueTextIdvAndVpc',
    IdvAndVpcConnectingText: 'Description.PrologueConnectingTextIdvAndVpc'
  },
  Error: {
    TryAgain: 'Response.ErrorTryAgain'
  }
};
