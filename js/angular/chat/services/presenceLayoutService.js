import chatModule from '../chatModule';

function presenceLayout(languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    userPresenceTypes: [
      {
        className: '',
        title: lang.get('Label.Offline') // "Offline"
      },
      {
        className: 'online',
        title: lang.get('Label.Online') // "Online"
      },
      {
        className: 'game',
        title: lang.get('Label.InGame') // "In Game"
      },
      {
        className: 'studio',
        title: lang.get('Label.InStudio') // "In Studio"
      }
    ],
    status: {
      offline: 0,
      online: 1,
      inGame: 2,
      inStudio: 3
    },
    conversion: {
      Online: 1,
      InGame: 2,
      InStudio: 3
    }
  };
}

chatModule.factory('presenceLayout', presenceLayout);

export default presenceLayout;
