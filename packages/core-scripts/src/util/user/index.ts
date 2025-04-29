import { FriendObject } from "../../data-store/stores/userData/userDataConstants";
import { types, DataKey } from "./constants";
import { fetchFromNetwork } from "./user";

// TODO: deprecated code

class UserInfoService {
  TYPE = types;

  friendsDict: Partial<Record<DataKey, Record<string, FriendObject>>>;

  constructor() {
    this.friendsDict = {};
  }

  refreshCacheData(type: "friendrequests", cacheCriteria: { isEnabled?: boolean }) {
    const { isEnabled } = cacheCriteria;
    return fetchFromNetwork(this.friendsDict, type, isEnabled);
  }
}

const userInfoService = new UserInfoService();

/**
 * @deprecated
 */
export default userInfoService;
