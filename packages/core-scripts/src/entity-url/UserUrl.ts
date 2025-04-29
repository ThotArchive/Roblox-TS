import EntityUrl from "./EntityUrl";

class UserUrl extends EntityUrl {
  // eslint-disable-next-line class-methods-use-this
  getRelativePath(id: number): string {
    return `/users/${id}/profile`;
  }

  // eslint-disable-next-line class-methods-use-this
  getReferralPath(): string {
    return "/users/refer";
  }
}

export default UserUrl;
