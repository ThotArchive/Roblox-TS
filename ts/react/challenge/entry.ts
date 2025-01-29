import Roblox from 'Roblox';
import * as Captcha from './captcha';
import * as DeviceIntegrity from './deviceIntegrity';
import * as ForceActionRedirect from './forceActionRedirect';
import * as Generic from './generic';
import * as HybridWrapper from './hybridWrapper';
import * as Interface from './interface';
import * as PrivateAccessToken from './privateAccessToken';
import * as ProofOfSpace from './proofOfSpace';
import * as ProofOfWork from './proofOfWork';
import * as Reauthentication from './reauthentication';
import * as Rostile from './rostile';
import * as SecurityQuestions from './securityQuestions';
import * as TwoStepVerification from './twoStepVerification';

// This type constraint (`typeof Interface`) ensures that any changes made to
// the shared interface types for this component get reflected in its compiled
// definition.
const AccountIntegrityChallengeService: typeof Interface = {
  Captcha,
  DeviceIntegrity,
  ForceActionRedirect,
  Generic,
  HybridWrapper,
  PrivateAccessToken,
  ProofOfSpace,
  ProofOfWork,
  Reauthentication,
  Rostile,
  SecurityQuestions,
  TwoStepVerification
};

Object.assign(Roblox, {
  AccountIntegrityChallengeService
});

// Side-effect of loading the prelude asynchronously.
Generic.loadPreludeIfMissing();
