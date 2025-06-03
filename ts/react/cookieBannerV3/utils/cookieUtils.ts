const getBaseDomain = (): string => {
  const currentHostname = window.location.hostname;
  let baseDomain = currentHostname;
  if (currentHostname.toLowerCase().startsWith('www.')) {
    baseDomain = currentHostname.substring(4);
  }
  return baseDomain;
};

const getCookie = (cname: string): string => {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

const setCookie = (cname: string, cvalue: string, exdays: number): void => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;

  const baseDomain = getBaseDomain();
  const domainAttribute = `;domain=.${baseDomain}`;

  document.cookie = `${cname}=${cvalue};${expires}${domainAttribute}`;
};

const deleteCookie = (cname: string): void => {
  const path = '/';
  const expires = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
  const cookieBase = `${cname}=; ${expires}; path=${path}`;

  const currentHostname = window.location.hostname;
  // Attempt to delete cookie regardless of how it was set

  // Cookie set with the full current hostname (e.g., "www.roblox.com")
  document.cookie = `${cookieBase}; domain=${currentHostname};`;

  // With the base domain (e.g., "roblox.com" from "www.roblox.com")
  const baseDomain = getBaseDomain();
  if (baseDomain !== currentHostname) {
    document.cookie = `${cookieBase}; domain=${baseDomain};`;
  }

  // With the base domain prefixed with a dot (e.g., ".roblox.com")
  if (baseDomain.split('.').length >= 2) {
    document.cookie = `${cookieBase}; domain=.${baseDomain}`;
  }

  // With no domain specified
  document.cookie = `${cookieBase};`;
};

export default { getCookie, setCookie, deleteCookie };
