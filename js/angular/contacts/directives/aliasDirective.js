import contactsModule from '../contactsModule';

function alias(resources) {
    "ngInject";
    return {
        restrict: 'A',
        scope: {
            alias: '<'
        },
        templateUrl: resources.templates.aliasTemplate
    }
};

contactsModule.directive('alias', alias);

export default alias; 