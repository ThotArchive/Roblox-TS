import { TFeatureSpecificData } from 'Roblox';
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
  featureSpecificData: TFeatureSpecificData;
  closeCallback: (access: Access) => string;
};

export const PrologueConstants = {
  Action: {
    Cancel: 'Action.Cancel',
    EmailMyParent: 'Action.EmailMyParent',
    VerifyID: 'Action.VerifyID',
    AskNow: 'Action.AskNowLowercase'
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
    IdvAndVpcConnectingText: 'Description.PrologueConnectingTextIdvAndVpc',
    VpcEnablePurchase: 'Description.PrologueEnablePurchase',
    VpcUnblockUser: 'Description.PrologueUnblockUser',
    VpcUnblockExperience: 'Description.PrologueUnblockExperience'
  },
  Error: {
    TryAgain: 'Response.ErrorTryAgain'
  }
};
