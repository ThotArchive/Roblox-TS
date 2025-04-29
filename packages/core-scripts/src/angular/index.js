const camelToKebab = str => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const extractHtmlFileName = str => {
  const file = str.split("/").pop();
  return file.replace(".html", "");
};

// we don't touch common template code is it might break other consumers
// so we just remove the surrounding script tags.
const removeScriptTag = str => {
  const scriptTagReg = /<\/?script[^>]*>/gi;
  return str.replace(scriptTagReg, "");
};

export const importAll = ctx => {
  ctx.keys().forEach(ctx);
};

export const templateCacheGenerator = (angular, moduleName, mainTplCtx, commonTplCtx) =>
  angular.module(moduleName, []).run([
    "$templateCache",
    tc => {
      if (mainTplCtx) {
        mainTplCtx.keys().forEach(key => {
          const name = camelToKebab(extractHtmlFileName(key));
          tc.put(name, mainTplCtx(key));
        });
      }
      if (commonTplCtx) {
        commonTplCtx.keys().forEach(key => {
          const name = camelToKebab(extractHtmlFileName(key));
          tc.put(name, removeScriptTag(commonTplCtx(key)));
        });
      }
    },
  ]);
