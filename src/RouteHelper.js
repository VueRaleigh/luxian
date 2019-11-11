// This simple class resolves routes on the client

export default class {
    constructor(baseUrl, routeMap, queryString="") {
        this.setBaseUrl(baseUrl);
        this.setUrlMap(routeMap);
        this.queryString = queryString;
    }

    setUrlMap(urlMap) {
        this.urlMap = urlMap;
        return this;
    }

    getUrlMap() {
        return this.urlMap;
    }

    setQuery(params={}) {
        let querySegment = Object.getOwnPropertyNames(params).map(key => {
            return `${key}=${encodeURIComponent(params[key])}`;
        });
        let query = querySegment.join("&");
        let wrappedCopy = Object.create(this);
        wrappedCopy.queryString = (query ? `?${query}` : '');
        return wrappedCopy;
    }

    setBaseUrl(newBase) {
        this.baseUrl = RegExp('.+/$').test(newBase) ? newBase.replace(/\/$/, "") : newBase;
        return this;
    }

    getBaseUrl() {
        return this.baseUrl;
    }

    relativeTo(newBase) {
        let wrappedCopy = Object.create(this);
        wrappedCopy.setBaseUrl(newBase);
        return wrappedCopy;
    }

    relative() {
        return this.relativeTo('.');
    }

    route(...args) {
        let name = args.shift();
        let urltemplate = this.urlMap[name];

        if (urltemplate === undefined) {
            throw 'Oops. The application is pointing at an unknown location "' + name + '".';
        }

        if (RegExp('^/.+').test(urltemplate)) {
            urltemplate = urltemplate.replace(/^\//, "");
        }

        // Object passed with keys for arguments
        if (args.length == 1 && args[0] !== null && typeof args[0] === 'object') {
            return this.baseUrl + '/' + urltemplate
                    .split('/')
                    .map((chunk) => {
                        if (chunk[0] == '{') {
                            let word = chunk.match(/{ *([^ }]+) *}/)[1];
                            if ((!word) || (!args[0][word])) {
                                return chunk;
                            }
                            return args[0][word];
                        } else {
                            return chunk;
                        }
                    }).join('/')
                + this.queryString;
        }

        // Positional parameters
        return this.baseUrl + '/' + urltemplate
                .split('/')
                .map(s => s[0] == '{' ? args.shift() : s)
                .join('/')
            + this.queryString;
    }
}
