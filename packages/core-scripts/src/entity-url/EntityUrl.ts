import environmentUrls from "@rbx/environment-urls";
import { formatUrl, resolveUrl } from "../util/url";

abstract class EntityUrl {
  // Each inheriting class for an entity should implement this abstract method
  abstract getRelativePath(id: number): string;

  abstract getReferralPath(): string;

  getAbsoluteUrl(id: number): string | null {
    if (typeof id !== "number") {
      return null;
    }

    const baseUrl = environmentUrls.websiteUrl;
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const relativePath = formatUrl({ pathname: this.getRelativePath(id) });
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return resolveUrl(baseUrl, relativePath);
  }

  navigateTo(id: number): void {
    const url = this.getAbsoluteUrl(id);
    if (url) {
      window.location.assign(url);
    }
  }
}

export default EntityUrl;
