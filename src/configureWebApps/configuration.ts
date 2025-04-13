const currentDomain = (): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hostname = window.location.hostname ?? "";
  return hostname.substring(hostname.indexOf(".") + 1);
};

const cookieName = "WebAppComponentSuffix";

export const readme =
  "setADInCookie({AD username}) is for set AD into cookie; getADFromCookie() returns current Current AD from cookie. For more questions, ask in #web-frontend slack channel";

export const getADFromCookie = (): string | null =>
  document.cookie
    .split("; ")
    .find(cookie => cookie.startsWith(`${cookieName}=`))
    ?.split("=")[1] ?? null;

export const setADInCookie = (value: string): string => {
  document.cookie = `${cookieName}=${encodeURIComponent(
    value,
  )}; path=/; domain=.${currentDomain()};`;

  const currentAD = getADFromCookie();
  if (value === "" && (currentAD == null || currentAD === "")) {
    return "You have reset back to master build";
  }
  if (currentAD === value) {
    return `Nice, you have set ${value} in cookie successfully!`;
  }
  return `Oh no, you have not set ${value} in cookie, could you try again ? or contact #web-frontend slack channel`;
};
