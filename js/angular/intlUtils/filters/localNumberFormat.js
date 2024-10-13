import intlUtilsModule from '../intlUtilsModule';

// This filter format in the number in a string by the locale of the user account
function localNumberFormatFilter(languageResource) {
  'ngInject';

  return function localNumberFormat(originString, formatType) {
    if (!originString) return originString;

    let stringToFormat = originString;
    if (typeof originString !== 'string') {
      stringToFormat = originString.toString();
    }
    return stringToFormat.replace(/(\d+)/g, (match, matchedNumber, offset, originStr) => {
      if (matchedNumber) {
        const number = Number(matchedNumber); // convert string to number
        if (languageResource.intl && number) {
          // formatType could be currency, percent...etc
          const result = formatType
            ? languageResource.intl.n(number, formatType)
            : languageResource.intl.n(number);
          return result;
        }
      }
      return originStr;
    });
  };
}

intlUtilsModule.filter('localNumberFormat', localNumberFormatFilter);

export default localNumberFormatFilter;
