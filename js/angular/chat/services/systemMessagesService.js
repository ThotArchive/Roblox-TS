import angular from 'angular';
import chatModule from '../chatModule';

function systemMessages(languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    playTogether: {
      pinGameUpdate(userName, gameName) {
        return lang.get('Message.PinGameUpdate', { userName: userName, gameName: gameName }); // "{userName} chose a game to play together: {gameName}"
      },
      playGameUpdate: lang.get('Message.PlayGameUpdate') // " is playing the pinned game: "
    }
  };
}

chatModule.factory('systemMessages', systemMessages);

export default systemMessages;
