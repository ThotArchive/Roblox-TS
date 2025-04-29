import modalModule from "../modalModule";

const modalOptions = {
  params: {
    // Text
    titleText: "",
    titleIcon: "",
    bodyText: "",
    bodyHtmlUnsafe: "",
    footerText: "",
    footerHtmlUnsafe: "",
    imageUrl: "",

    // Buttons
    // <sl:translate>
    actionButtonShow: false,
    actionButtonClass: "btn-secondary-md",
    actionButtonId: "modal-action-button",

    neutralButtonShow: true,
    neutralButtonClass: "btn-control-md",
    // <sl:translate>
    closeButtonShow: true,

    // Other
    cssClass: "modal-window",
  },
  defaults: {
    keyboard: true,
    animation: false,
  },
  commonTemplateUrl: "common-modal",
  commonController: "modalController",
  layoutParams: {
    modalSelector: ".modal",
    modalContentClass: "modal-content",
  },
  backdropStatus: {
    static: "static",
  },
  userInteraction: {
    mouseDown: "mousedown",
  },
  mainButtonPressed: 0,
};

modalModule.constant("modalOptions", modalOptions);

export default modalOptions;
