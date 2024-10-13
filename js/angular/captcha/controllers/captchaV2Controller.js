import captchaV2 from '../captchaV2Module';

function captchaV2Controller(captchaV2Service, captchaV2Constants, funCaptchaService, $scope) {
  'ngInject';

  const ctrl = this;
  let active = false;
  let lastActivated = false;

  ctrl.id = null;
  ctrl.captchaEnded = function () {
    ctrl.activated = false;
    ctrl.shown = false;
    active = false;
  };

  ctrl.captchaShown = function () {
    ctrl.shown = true;
    $scope.$apply();
  };

  ctrl.hideCaptcha = function () {
    ctrl.activated = false;
    if (ctrl.captchaDismissed) {
      ctrl.captchaDismissed()();
    }
  };

  ctrl.getCaptchaClasses = function () {
    return {
      'captcha-activated': ctrl.shown && ctrl.activated
    };
  };

  const init = function () {
    if (ctrl.id === null) {
      ctrl.id = captchaV2Service.getCaptchaId();
    }

    if (!ctrl.activated || active) {
      return;
    }

    active = true;

    const returnTokenInSuccessCb = ctrl.returnTokenInSuccessCb === true;
    let successCb;
    if (returnTokenInSuccessCb) {
      successCb = function (eventData) {
        if (ctrl.activated) {
          let token;
          let captchaId = '';
          if (eventData.constructor === String) {
            token = eventData;
          } else {
            token = eventData.token;
            captchaId = eventData.unifiedCaptchaId;
          }
          const captchaData = {
            captchaId,
            captchaToken: token,
            captchaProvider: captchaV2Constants.captchaProviders.arkoseLabs
          };
          ctrl.captchaPassed()(captchaData);
        }

        ctrl.captchaEnded();
      };
    } else {
      successCb = function () {
        if (ctrl.activated) {
          ctrl.captchaPassed()();
        }

        ctrl.captchaEnded();
      };
    }

    funCaptchaService
      .render(
        ctrl.id,
        ctrl.captchaActionType,
        ctrl.captchaShown,
        returnTokenInSuccessCb,
        ctrl.inputParams,
        ctrl.extraValidationParams
      )
      .then(successCb, function (errorCode) {
        if (ctrl.activated) {
          ctrl.captchaFailed()(errorCode);
        }

        ctrl.captchaEnded();
      });
  };

  // doCheck required for two way binding change detection: https://stackoverflow.com/a/41978174/1663648
  const doCheck = function () {
    if (lastActivated !== ctrl.activated) {
      lastActivated = ctrl.activated;
      ctrl.$onInit();
    }
  };

  ctrl.$onInit = init;
  ctrl.$doCheck = doCheck.bind(ctrl);
}

captchaV2.controller('captchaV2Controller', captchaV2Controller);

export default captchaV2Controller;
