import chatModule from '../chatModule';

function pinGameLayout(languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    tooltipForPinGame: lang.get('Label.PinGameTooltip'), // "Pin Game",
    tooltipForUnPinGame: lang.get('Label.UnpinGameTooltip'),
    titleForPinGame: lang.get('Label.PinnedGame') // "Pinned Game"
  };
}

chatModule.factory('pinGameLayout', pinGameLayout);

export default pinGameLayout;
