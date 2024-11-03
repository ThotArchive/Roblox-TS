import chatModule from '../chatModule';

function gameLayout(languageResource) {
  'ngInject';

  const lang = languageResource;
  function getPlaceName(placeName) {
    return `<span class='font-bold'>${  placeName  }</span>`;
  }

  function getRobuxPrice(robux) {
    return `<span class='icon-robux-16x16'></span><span class='text-robux'>${  robux  }</span>`;
  }
  return {
    playButtonTypes: {
      play: 'play',
      join: 'join',
      buy: 'buy',
      details: 'details',
      notAvailable: 'notAvailable'
    },
    playButtons: {
      play: {
        type: 'play',
        text: lang.get('Label.PlayButton'), // "Play",
        className: 'btn-primary-xs btn-growth-xs',
        isPlayable: true
      },
      join: {
        type: 'join',
        text: lang.get('Label.JoinButton'), // "Join",
        className: 'btn-primary-xs btn-growth-xs',
        isPlayable: true
      },
      buy: {
        type: 'buy',
        text: lang.get('Label.BuyButton'), // "Buy",
        className: 'btn-control-xs',
        isPlayable: false
      },
      details: {
        type: 'details',
        text: lang.get('Label.ViewDetailsButton'), // "View Details",
        className: 'btn-control-xs',
        isPlayable: false
      },
      notAvailable: {
        type: 'notAvailable',
        text: lang.get('Label.GameNotAvailableButton'), // "Not Available",
        isPlayable: false
      }
    },
    buyAccess: {
      title: lang.get('Heading.BuyItem'), // "Buy Item",
      yesButtonText: lang.get('Action.BuyAccess'), // "Buy Access",
      yesButtonClass: 'btn-primary-xs btn-growth-xs',
      noButtonText: lang.get('Action.Cancel'), // "Cancel",
      bodyText(placeName, creatorName, robux) {
        let placeNameString = getPlaceName(placeName);
        let robuxString = getRobuxPrice(robux);
        return lang.get('Label.BuyAccessToGameForModal', {
          placeName: placeNameString,
          creatorName: creatorName,
          robux: robuxString
        }); // "Would you like to buy access to the Place: {placeName} from {creatorName} for {robux}?"
      }
    }
  };
}

chatModule.factory('gameLayout', gameLayout);

export default gameLayout;
