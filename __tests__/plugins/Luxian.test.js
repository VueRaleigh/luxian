import { createLocalVue, shallowMount } from '@vue/test-utils';

const localVue = createLocalVue();

const mockRouteList = {data: {data: {routes: {"current-user": 'api/users/current', "application-routes": 'api/application/routes', "user": "api/users/{id}"}}}};
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve(mockRouteList)),
  put: jest.fn((url, args) => {
    return Promise.resolve(args);
  }),
  post: jest.fn((url, args) => {
    return Promise.resolve(args);
  }),
  delete: jest.fn(() => Promise.resolve('called delete')),
  create() { return this; },
  defaults: { headers: { common: [] }}
}));
import mockaxios from 'axios';

import Luxian from '@/index';
const pluginOptions = {
  httpHandler: mockaxios,
  urlBase: 'https://fakehost/fakepath',
  routesList: mockRouteList.data.data.routes
};
localVue.use(Luxian, pluginOptions);

let SomeComponent = localVue.component('some-component', {
  template: "<div>Nothing to see here</div>"
});

describe('Luxian.test.js', () => {
  let wrapper, component, api;

  beforeEach(() => {
    wrapper = shallowMount(SomeComponent, {
        localVue,
    });
    component = wrapper.vm;
    api = component.$api;
    mockaxios.get.mockClear();
    mockaxios.put.mockClear();
    mockaxios.post.mockClear();
    mockaxios.delete.mockClear();
  });
  // Vue.prototype.$api
  // Vue.prototype.$routesResolved
  // Vue.prototype.$api.normalize(urlName)
  //
  // this.$api.donors.get()
  // this.$api.withParams({params}).donors.post(dataobj)
  // this.$api.withParams({params}).donors.post(dataobj)
  // this.$api.withParams({id: foo}).donors.delete()
  //
  // Getting Links. Because the api endpoints are loaded async,
  // they must _not_ be assumed to be statically available from time tick 0.
  //
  // Use Promise.then to assign the resolved value to a reactive data elment,
  // or use await in the context of an async function body:
  // this.$api.currentUser.asLink().then((link) => {
  //     this.myImportantLink = link;
  // });
  // async somemethod() {
  //      ...
  //     this.myImportantLink = await this.$api.currentUser.asLink();
  //      ...
  // }

  it('possesses the application routes when first configured', async () => {
    expect.assertions(1);
    const helper = component.$api.$routeHelper;
    expect(helper.getUrlMap()).toEqual(mockRouteList.data.data.routes);
  });

  it('exposes the $api.normalize routine it uses to convert CamelCase and underscore to hyphenated-case', async () => {
    expect.assertions(6);
    expect(component.$api.normalize).toBeInstanceOf(Function);
    expect(component.$api.normalize('aCamelCaseString')).toEqual('a-camel-case-string');
    expect(component.$api.normalize('snake_case_string')).toEqual('snake-case-string');
    expect(component.$api.normalize('dot.notation')).toEqual('dot-notation');
    expect(component.$api.normalize('Spaces in string')).toEqual('spaces in string');
    expect(component.$api.normalize('')).toEqual('');
  });

  it('can formulate a GET request', async () => {
    expect.assertions(1);
    expect(component.$api.currentUser.get()).resolves.toEqual(mockRouteList);
  });

  it('can formulate PUT and POST requests with parameters, that take a payload', async () => {
    expect.assertions(8);
    expect(await component.$api.user.put({foo: 1, bar: 2})).toEqual({foo: 1, bar: 2});
    expect(mockaxios.put).toHaveBeenCalledWith( lookupOptions.urlBase + '/api/users/', {foo: 1, bar: 2});
    expect(await component.$api.withParams({id: 2}).user.post({foo: 3, bar: 4})).toEqual({foo: 3, bar: 4});
    expect(mockaxios.post).toHaveBeenCalledWith( lookupOptions.urlBase + '/api/users/2', {foo: 3, bar: 4});
    expect(mockaxios.get).toHaveBeenCalledTimes(0);
    expect(mockaxios.put).toHaveBeenCalledTimes(1);
    expect(mockaxios.post).toHaveBeenCalledTimes(1);
    expect(mockaxios.delete).toHaveBeenCalledTimes(0);

  });

  it('can formulate a request with replaceable parameters, and return it as a link', async () => {
    expect.assertions(1);
    expect(await component.$api.withParams({id: 1234}).user.asLink()).toEqual(
        lookupOptions.urlBase + '/api/users/1234'
    );
  });

  it('can formulate a DELETE request', async () => {
    expect.assertions(2);
    expect(await component.$api.withParams({id: 123}).user.delete()).toEqual('called delete');
    expect(mockaxios.delete).toHaveBeenCalledWith( lookupOptions.urlBase + '/api/users/123');
  });

  it('ignores unused request parameters', async () => {
    expect.assertions(1);
    expect(await component.$api.withParams({id: 1234, foobar: 54321}).user.asLink()).toEqual(
        lookupOptions.urlBase + '/api/users/1234'
    );
  });

  it('can include ?y=x query string parameters', async () => {
    expect.assertions(1);
    expect(await component.$api.withQuery({search: 1234}).currentUser.asLink()).toEqual(
      lookupOptions.urlBase + '/api/users/current?search=1234'
    );
  });

});

