import angularJsUtilitiesModule from '../angularJsUtilitiesModule';
import quote from '../../../core/utils/textFormat/quote';

function quoteText() {
  'ngInject';

  return function(input) {
    return quote.quoteText(input);
  };
}

angularJsUtilitiesModule.filter('quoteText', quoteText);
export default quoteText;
