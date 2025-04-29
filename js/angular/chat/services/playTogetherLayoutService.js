import chatModule from '../chatModule';

function playTogetherLayout(languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    numberOfMembers: {
      inPinnedGame: 3,
      inActiveGame: 4
    },

    gameListScrollListSelector: '#active-game-list',

    activeGamesList: {
      maxNumberForFit: 4,
      minNumberForFit: 1,
      limitNumber: 1,
      showMore(count) {
        return lang.get('Label.ShowMoreGames', { count }); // "Show More (+{count})",
      },
      showMoreText: '',
      showLess: lang.get('Label.ShowLessGames'), // "Show Less",
      toggleMenuText: '',
      isCollapsed: true,
      pinGameIsInActiveGames: false
    },

    recommendedLabel: lang.get('Label.RecommendedGames') // "Recommended",
  };
}

chatModule.factory('playTogetherLayout', playTogetherLayout);

export default playTogetherLayout;
