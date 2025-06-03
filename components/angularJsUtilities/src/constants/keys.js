import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const isIE = () =>
  navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > -1;

const keys = {
  backspace: "Backspace",
  tab: "Tab",
  enter: "Enter",
  escape: isIE() ? "Esc" : "Escape",
  delete: isIE() ? "Del" : "Delete",
  alt: "Alt",
  capsLock: "CapsLock",
  control: "Control",
  numLock: "NumLock",
  scrollLock: "ScrollLock",
  shift: "Shift",
  space: isIE() ? "Spacebar" : " ",
  arrowDown: isIE() ? "Down" : "ArrowDown",
  arrowLeft: isIE() ? "Left" : "ArrowLeft",
  arrowRight: isIE() ? "Right" : "ArrowRight",
  arrowUp: isIE() ? "Up" : "ArrowUp",
  end: "End",
  home: "Home",
  pageDown: "PageDown",
  pageUp: "PageUp",
  insert: "Insert",
  f1: "F1",
  f2: "F2",
  f3: "F3",
  f4: "F4",
  f5: "F5",
  f6: "F6",
  f7: "F7",
  f8: "F8",
  f9: "F9",
  f10: "F10",
  f11: "F11",
  f12: "F12",
};

for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i += 1) {
  keys[String.fromCharCode(i)] = String.fromCharCode(i);
  keys[String.fromCharCode(i).toLowerCase()] = String.fromCharCode(i).toLowerCase();
}

angularJsUtilitiesModule.constant("keys", keys);
export default keys;
