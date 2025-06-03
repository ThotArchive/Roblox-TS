const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";

export const isMac = /Mac OS X/i.test(userAgent);
export const isWindows = /Windows NT/i.test(userAgent);
export const isLinux = /Linux/i.test(userAgent) && !/Android/i.test(userAgent);
export const isAndroid = /Android/i.test(userAgent);
export const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
export const isMobile = isAndroid || isIOS;
export const isDesktop = !isMobile;
