import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function cacheService() {
    "ngInject";
    return {
        createPaginationCache: function (pageSize) {
            var cache = {};
            
            return {
                getPage: function(key, pageNumber) {
                    if(cache[key]) {
                        return cache[key].slice((pageNumber - 1) * pageSize, pageNumber * pageSize);;
                    }
                    return [];
                },
                getLength: function(key) {
                    return cache[key] ? cache[key].length : 0;
                },
                append: function(key, values) {
                    if(!cache[key]) {
                        cache[key] = [];
                    }
                    cache[key] = cache[key].concat(values);
                },
                removePage: function (key, pageNumber) {
                    if (cache[key]) {
                        cache[key].splice((pageNumber - 1) * pageSize, pageSize);
                    }
                },
                removeAtIndex: function (key, pageNumber, index) {
                    if (cache[key]) {
                        cache[key].splice(((pageNumber - 1) * pageSize) + index, 1);
                    }
                },
                clear: function(key) {
                    cache[key] = [];
                }
            };
        },
        buildKey: function (values) {
            var key = "";
            for (var n in values) {
                if (values.hasOwnProperty(n)) {
                    key += "&" + n + "=" + values[n];
                }
            }
            return key;
        }
    };
}

angularJsUtilitiesModule.factory("cacheService", cacheService);

export default cacheService;