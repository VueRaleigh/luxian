import RouteHelper from "./routeHelper";

const Lookups = {
    // The install method is all that needs to exist on the plugin object.
    // It takes the global Vue object as well as user-defined options.
    install(Vue, options) {
        let terminatedWithSlash = RegExp('.*/$');

        let base = options.urlBase;
        if (!terminatedWithSlash.test(base)) {
            base = base + '/';
        }
        let axios = options.axios;
        let routes = options.routesList || [];

        async function getRoutes() {
            return await axios.get(base + options.appRoutesUrl).then((response) => {
                return response.data.data.routes;
            });
        }

        let resolvedRoutesPromise=null;
        if ((routes.length==0) && options.appRoutesUrl) {
            resolvedRoutesPromise = getRoutes().then((result) => {
                return routes = result;
            });
            Vue.prototype.$resolveApiRoutes = () => { return resolvedRoutesPromise; };
        } else {
            resolvedRoutesPromise = new Promise((resolve, reject) => { resolve(options.routesList); });
        }


        let normalize = function(name) {
            let routeName = name.split(/(?=[A-Z])/).join('_').toLowerCase()
            return routeName.replace(/_/g, '-');
        };

        let urlFactory = function() {
            return new RouteHelper(base, routes);
        };


        let asyncUrlFactory = async function() {
            let routeList = await resolvedRoutesPromise;
            return new RouteHelper(base, routeList);
        };

        Vue.prototype.$makeUrl = urlFactory;
        Vue.prototype.$normalizeUrl = normalize;

        // this.$lookup({params, 'query': {...queryprops} }).lookupDonorTypes
        Vue.prototype.$lookup = (parameters={}) => {
            return new Proxy({}, {
                get: function(target, propname, reciever) {
                    let url = urlFactory();

                    if (parameters.query) {
                        url = url.setQuery(parameters.query);
                    }
                    url = url.route(normalize(propname), parameters);

                    return axios.get(url);
                }
            });
        };

        // this.$api.lookupDonorTypes.get()
        // this.$api.withParams({params}).withQuery({query}).lookupDonorTypes.get()
        // this.$api.withParams({queryparams}).lookupDonorTypes.get()
        // let donor this.$api.withParams({params}).donors.post(dataobj)
        // this.$api.withParams({params}).donors.post(dataobj)
        // this.$api.withParams({id: foo}).donors.delete()
        Vue.prototype.$api =  new Proxy({}, {
            query: {},

            params: {},

            get: function (target, name, reciever) {
                    if (['query', 'params'].includes(name)) {
                        return target[name];
                    }

                    if ('withQuery' === name) {
                        return function (props={}) {
                            let newApi = Object.create(this);
                            newApi.query = props;
                            return newApi;
                        };
                    }

                    if ('withParams' === name) {
                        return function (props={}) {
                            let newApi = Object.create(this);
                            newApi.params = props;
                            return newApi;
                        };
                    }

                    // Otherwise we assume it is an API endpoint name
                    let url = asyncUrlFactory();
                    let urlName = normalize(name);
                    let proxy = {
                        url: url.then((routeHelper) => {return routeHelper.setQuery(reciever.query)}),

                        async get() {
                            let rh = await this.url;
                            return axios.get(rh.route(urlName, reciever.params));
                        },
                        async post(data) {
                            let rh = await this.url;
                            return axios.post(rh.route(urlName, reciever.params), data);
                        },
                        async put(data) {
                            let rh = await this.url;
                            return axios.put(rh.route(urlName, reciever.params), data);
                        },
                        async delete() {
                            let rh = await this.url;
                            return axios.delete(rh.route(urlName, reciever.params));
                        }
                    };

                    return proxy;
            }
        });
    }
};

export default Lookups;