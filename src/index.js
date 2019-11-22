import RouteHelper from './RouteHelper';

// let customer = await this.$api.withParams(paramObj).customersStore.post(payloadObj);
// this.$api.withParams(paramsObj).customersStore.post(payloadObj).then( result => { // etc etc
// this.$api.withParams({customer: custId}).customersDestroy.delete()
// this.$api.withParams({customer: custId}).customersShow.get()
// this.$api.withQuery({search: 'someSearchString'}).customersIndex.get()
//
// Getting Links
// The route list is assumed to be loaded prior to plugin initialization,
// so the asLink method is not async:
// this.myImportantLink = this.$api.currentUser.asLink();
//
export default {
  install: function(Vue, options) {
        if (!(options.urlBase && options.httpHandler && options.routesList)) {
            throw 'Luxian requires urlBase, httpHandler, and routesList options. "'+JSON.stringify(options)+ '" given.';
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
                    asLink() {
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
