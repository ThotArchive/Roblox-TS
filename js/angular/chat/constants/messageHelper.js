import chatModule from '../chatModule';

const messageHelper = {
  linkCardTypes: {
    gameCard: 'gameCard',
    catalogItemCard: 'catalogItemCard',
    libraryItemCard: 'libraryItemCard'
  },
  messageRegexs: {
    gameCard: new RegExp(/\/games\/(\d+)/) // catalogItemCard: new RegExp(/\/catalog\/(\d+)/), libraryItemCard: new RegExp(/\/library\/(\d+)/)
  },
  gameCardRegexs: {
    privateServerLinkCode: new RegExp(/privateServerLinkCode=(\S+)/)
  },
  urlRegex: new RegExp(
    /(https?:\/\/(?:www\.|(?!www)|(?:web\.))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|web\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www)|(?:web\.))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/
  ),
  onlyNewLineRegex: new RegExp(/^[\r|\n|\s]+$/),
  removeNewLineRegex: new RegExp(/^\n+|\n+$/g),
  emojiRegex: new RegExp(
    /\u200D|\uFE0F|(?:[\xA9\xAE\u2122\u23E9-\u23EF\u23F3\u23F8-\u23FA\u24C2\u25B6\u2600-\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDE51\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g
  ),
  zwjRegex: new RegExp(/\u200D/),
  emojiRepRegex: new RegExp(/\uFE0F/),
  messageTypes: {
    user: 'user',
    system: 'system'
  }
};

chatModule.constant('messageHelper', messageHelper);

export default messageHelper;
