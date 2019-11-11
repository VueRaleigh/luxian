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
=======
import RouteHelper from './RouteHelper';

// let customer = await this.$api.withParams(paramObj).customersStore.post(payloadObj);
// this.$api.withParams(paramsObj).customersStore.post(payloadObj).then( result => { // etc etc
// this.$api.withParams({customer: custId}).customersDestroy.delete()
// this.$api.withParams({customer: custId}).customersShow.get()
// this.$api.withQuery({search: 'someSearchString'}).customersIndex.get()
//
// Getting Links
// Since api endpoints can be loaded asynchronously,
// they should not be assumed to be immediately available.
// You can use Promise.then to set a data model element, and rely on Vue's reactivity:
// this.$api.customerShow.asLink().then((link) => {
//     this.myImportantLink = link;
// });
//
// Or make use of await (only in the context of an async function body
// async somemethod() {
//      ...
//     this.myImportantLink = await this.$api.currentUser.asLink();
//      ...
// }
//
export default {
    // The install method is all that needs to exist on the plugin object.
    // It takes the global Vue object as well as user-defined options.
    install(Vue, options) {

        if (!(options.urlBase && options.httpHandler && options.routesList)) {
            throw 'Lookups requires urlBase, httpHandler, and routesList options';
        }

        const urlBase = options.urlBase + ((!RegExp('.*/$').test(options.urlBase)) ? '/' : '');
        const http = options.httpHandler;

        const normalize = (typeof options.normalizer === 'function') ? options.normalizer : (name='') => {
            const routeName = name.split(/(?=[A-Z])/).join('_').toLowerCase();
            return routeName.replace(/[_.-]+/g, '-');
        };

        let normalizedRoutes = {};
        Object.getOwnPropertyNames(options.routesList).forEach(name => {
            normalizedRoutes[normalize(name)] = options.routesList[name];
        });
        const urlHelper = () => new RouteHelper(urlBase, normalizedRoutes);

        Vue.prototype.$api = new Proxy({}, {
            query: {},

            params: {},

            get: function(target, name, reciever) {
                if (['query', 'params'].includes(name)) {
                    return target[name];
                }

                if ('$routeHelper' === name) {
                    return urlHelper();
                }

                if ('$httpHandler' === name) {
                    return http;
                }

                if ('normalize' === name) {
                    return normalize;
                }

                if ('withQuery' === name) {
                    return function(props={}) {
                        let newApi = Object.create(this);
                        newApi.query = props;
                        return newApi;
                    };
                }

                if ('withParams' === name) {
                    return function(props={}) {
                        let newApi = Object.create(this);
                        newApi.params = props;
                        return newApi;
                    };
                }

                // Otherwise we assume name is an API endpoint name
                const urlName = normalize(name);

                const trappedInterfaces = {
                    async asLink() {
                        return urlHelper().setQuery(reciever.query).route(urlName, reciever.params);
                    },
                    async get() {
                        return http.get(urlHelper().setQuery(reciever.query).route(urlName, reciever.params));
                    },
                    async post(data) {
                        return http.post(urlHelper().setQuery(reciever.query).route(urlName, reciever.params), data);
                    },
                    async put(data) {
                        return http.put(urlHelper().setQuery(reciever.query).route(urlName, reciever.params), data);
                    },
                    async patch(data) {
                        return http.patch(urlHelper().setQuery(reciever.query).route(urlName, reciever.params), data);
                    },
                    async delete() {
                        return http.delete(urlHelper().setQuery(reciever.query).route(urlName, reciever.params));
                    }
                };

                const wrapper = new Proxy(http, {
                    get: function(target, name, reciever) {
                        if (trappedInterfaces[name]) {
                            return trappedInterfaces[name];
                        }
                        return Reflect.get(...arguments);
                    }
                });

                return wrapper;
            }
        });
    }
};
