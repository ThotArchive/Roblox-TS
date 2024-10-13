
function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function extractHtmlFileName(str) {
    let file = str.split('/').pop();
    return file.replace('.html', '');
}

//we don't touch common template code is it might break other consumers
//so we just remove the surrounding script tags.
function removeScriptTag(str) {
    var scriptTagReg = /<\/?script[^>]*>/gi;
    return str.replace(scriptTagReg, '');
}

const ES6MigrationHelper = {

    importFilesUnderPath: (ctx) => {
        ctx.keys().forEach(ctx);
    },

    templateCacheGenerator: (angular, moduleName, mainTplCtx, commonTplCtx) => {
        return angular.module(moduleName, [])
            .run(['$templateCache', function (tc) {
                if (mainTplCtx) {
                    mainTplCtx.keys().forEach(key => {
                        let name = camelToKebab(extractHtmlFileName(key));
                        tc.put(name, mainTplCtx(key));
                    });
                }
                if (commonTplCtx) {
                    commonTplCtx.keys().forEach(key => {
                        let name = camelToKebab(extractHtmlFileName(key));
                        tc.put(name, removeScriptTag(commonTplCtx(key)));
                    });
                }
            }]);
    }
};

module.exports = ES6MigrationHelper;