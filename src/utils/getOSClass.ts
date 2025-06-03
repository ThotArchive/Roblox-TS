import { isMac, isWindows, isIOS, isAndroid } from "./detectOS";

export default function getOSClass(): string {
  if (isMac) return "mac";
  if (isWindows) return "windows";
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "windows";
}
