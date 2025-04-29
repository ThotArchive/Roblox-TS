import EntityUrl from "./EntityUrl";

class GameUrl extends EntityUrl {
  // eslint-disable-next-line class-methods-use-this
  getRelativePath(id: number): string {
    return `/games/${id}`;
  }

  // eslint-disable-next-line class-methods-use-this
  getReferralPath(): string {
    return "/games/refer";
  }
}

export default GameUrl;
