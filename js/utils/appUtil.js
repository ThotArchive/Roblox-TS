export function getUrlUserId() {
  const reg = /\/users\/(\d+)\//g;
  const match = reg.exec(window.location.pathname);
  return match ? match[1] : null;
}
