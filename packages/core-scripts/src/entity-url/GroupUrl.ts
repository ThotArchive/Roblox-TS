import EntityUrl from "./EntityUrl";

class GroupUrl extends EntityUrl {
  // eslint-disable-next-line class-methods-use-this
  getRelativePath(id: number): string {
    return `/groups/${id}`;
  }

  // eslint-disable-next-line class-methods-use-this
  getReferralPath(): string {
    return "/groups/refer";
  }
}

export default GroupUrl;
