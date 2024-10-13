const getCurrentDomain = (): string => {
  const hostname = window?.location?.hostname ?? '';
  return hostname.substring(hostname.indexOf('.') + 1);
};

const suffixOfWebApp = 'WebAppComponentSuffix';

const readme =
  'setADInCookie({AD username}) is for set AD into cookie; getADFromCookie() returns current Current AD from cookie. For more questions, ask in #web-frontend-guild slack channel';

const getADFromCookie = (): string => {
  const cookies = document.cookie.split(';');
  let currentAD = null;
  cookies.forEach(cookie => {
    const currentCookie = cookie.trim();
    if (currentCookie && currentCookie.startsWith(suffixOfWebApp)) {
      const currentValues = currentCookie.split('=');
      currentAD = currentValues.pop();
    }
  });
  return currentAD;
};

const setADInCookie = (value: string): string => {
  let currentAD: string = getADFromCookie();
  const cookie = `${suffixOfWebApp}=${encodeURIComponent(
    value
  )}; path=/; domain=.${getCurrentDomain()};`;
  document.cookie = cookie;

  if (currentAD?.length > 0 && value?.length === 0) {
    return 'You have reset back to master build';
  }
  currentAD = getADFromCookie();
  if (currentAD?.length > 0 && value?.length === 0) {
    return 'You have reset back to master build';
  }
  if (currentAD === value) {
    return `Nice, you have set ${value} in cookie successfully!`;
  }
  return `Oh no, you have not set ${value} in cookie, could you try again ? or contact #web-frontend-guild slack channel`;
};

export default {
  setADInCookie,
  getADFromCookie,
  readme
};
