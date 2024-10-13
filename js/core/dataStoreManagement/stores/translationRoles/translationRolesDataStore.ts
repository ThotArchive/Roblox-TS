import { AxiosPromise } from 'axios';
import 
    * as
    TranslationRolesProvider
 from '../../providers/translationRoles/translationRolesProvider';

const rolesApiInstance = new TranslationRolesProvider.GameLocalizationRolesApi();

enum LocalizationRoles{
    Translator = 'translator'
};
const getGamesListForTranslator = (pageSize: number, exclusiveStartKey: string, groupId?: number): AxiosPromise<TranslationRolesProvider.RobloxTranslationRolesApiGetGameLocalizationRoleAssignmentsForUserResponse> => {
    return rolesApiInstance.v1GameLocalizationRolesRolesRoleCurrentUserGet(LocalizationRoles.Translator, exclusiveStartKey, pageSize, groupId, { withCredentials: true });
};

export default {
    getGamesListForTranslator,
};