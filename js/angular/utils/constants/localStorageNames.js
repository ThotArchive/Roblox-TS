import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { CurrentUser } from "Roblox";

const localStorageNames = {
    friendsDict: CurrentUser ? "Roblox.FriendsDict.UserId" + CurrentUser.userId : "Roblox.FriendsDict.UserId0"
    };

angularJsUtilitiesModule.constant("localStorageNames", localStorageNames);
export default localStorageNames;