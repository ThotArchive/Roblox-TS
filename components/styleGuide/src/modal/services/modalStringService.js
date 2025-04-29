import modalModule from "../modalModule";

function modalStringService(languageResource) {
  "ngInject";

  const lang = languageResource;

  return {
    params: {
      actionButtonText: lang.get("Action.Yes"),
      neutralButtonText: lang.get("Action.OK"),
    },
  };
}

modalModule.service("modalStringService", modalStringService);

export default modalStringService;
