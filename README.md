# 路线 Lùxiàn

Lùxiàn is a Vue plugin enabling a simple syntax to access API endpoints. 

```js
let newResource = await this.$api.wayCoolResourcesStore.post(payload);
```

It is a terrible practice to hard-code URL paths in source code.
This package combines a light-weight URL helper with an HTTP handler 
to completely eliminate hard-coded references to URL paths.

## Quickstart

You can install Lùxiàn via `npm install luxian` or `yarn add luxian`

*The package and file names use non-accented characters.*

```js
import Axios from 'axios'
import Luxian from 'luxian'
import routeList from 'routeList'

Vue.use(Luxian, {
    httpHandler: Axios,
    urlBase: 'https://www.somedoma.in/some/path',
    routeList
})
```

### Route List format

The format for route lists is derived from Laravel's route map.
The route list can either be exported to a `.json` file and bundled
or loaded via a well-known route.

```js
export default {
    routes: {
        "current-user": 'api/users/current',
        "application-routes": 'api/application/routes',
        "user": "api/users/{id}",
        "some_strange-name.usedHere": "some/strange/{name}/here",
        "surveyResults.search": "results/survey/",
        "postal-codes": "api/codes/postal/{countryCode}"
    }
}
```

By default, route list property names are normalized to convert camelCase, snake_case, and dot.notation into fully hyphenated-case names. 

### Client Code Examples

#### Get

Fetch postal codes, and do something with the response.
The proxied http methods return the same Promises of the `httpHandler` methods:

```
this.$api.withParams({countryCode: 'CA'}).postalCodes.get().then((response) => {
    this.doSomethingWithZipCodes(response);
}).catch((errors)=> {
    this.$emit('app-error', errors);
})
```

#### Get with Query String

Do a search with a query string.
Query values are converted via `encodeURIComponent` before being included:

```js
this.$api.withQuery({ subjects: 'MAT NE' }).surveyResultsSearch.get({ payload... }).then( 
   // sends to results/survey?subjects=MAT%20NE
)
```

#### Post

Post something to some strange URL used here. 
By default, URL names are normalized to allow for either `['hypenated-name']` or `.camelCase` access:

```js
const payloadObject = { parm1: 1, parm2: 2 };

let result = await this.$api.someStrangeNameUsedHere.post(payloadObject);

let otherResult = await this.$api['some-strange-name-used-here'].post(payloadObject);
```

#### asLink (anchor url)

Use asLink() to get the rendered route. Unlike the other methods, this one is not async:

```html
<img src="$api.withParams(name:'sylvester').catImageLibrary.asLink()" alt="Sylvester the cat"/>
blah blah <a :href="$api.someNamedLocation.asLink()">Go to some location</a> blah blah
```

## Required Parameters and Options

- httpHandler
    - required
    - The http handler.
    - _The plugin was written for Axios. It has not yet been adapted for other handlers._
- urlBase
    - required
    - The base URL path used to resolve the rest of the application routes.
    - _The plugin assumes one base URL. It has not yet been adapted to deal with multiple services._
- routeList
    - required
    - An object, the keys of which are URL names and the values of which are simple URL templates.
- normalizer
    - optional
    - Function used to translate camelCase javascript identifiers into the format of keys of the routeList.

## Usage Synopsis

### $api

Lùxiàn exposes a [fluent builder interface](https://martinfowler.com/bliki/FluentInterface.html)
via an `$api` property. Call your API
endpoints by an abstract name, given required and optional parameters,
query string arguments, and/or URL document fragment identifiers.

```js
this.$api
    .withParams(paramsObject)

    .withQuery(queryArgsObject)

    .APIEnpointName

    .post(payloadObject) // or .get(), .delete(), .put(payload), .asLink()

    .then(successCallback)

    .catch(failureCallback)

    .finally(cleanupCallback)
```

Internally, the `$api` property is implemented as a Javascript 
`Proxy` object. Accessing any property name invokes the plugin.

#### withParams and withQuery

If one of the optional binding methods `withParams` or `withQuery` is accessed,
a new Proxy is returned with URL parameters or query bound to the given object.

The `withParams`  method accepts an Object whose values are used to replace URL parameters in the routeList URL templates.
The keys of the object passed to `withParams` correspond exactly to parameters as referenced in the URL template.
URL template parameters which are not matched by a `withParams` Object key are left as-is are silently ignored.
Parameters which are not matched by any property are left as-is in the rendered URL string when it is finally resolved.

The `withQuery` method accepts an Object whose keys and values are used to
compose a `?key1=value1&key2=value2` style query string. Object property names
are used as-is. Values are converted via `encodeURIComponent` before being included in the query string.
There is not presently a means of including a lone property name or other string.

#### .query and .params

The binding methods completely replace their respective bindings. 
Although the methods may be chained fluently, their effects are not additive. 
To add new parameters to existing parameters, you can get the current `params` property, and use the spread operator to pass it back to `withParams`.
The same can be done with `query` and `withQuery`: 

```js
let endpoint = this.$api.withParams({countryCode: 'US'}).withQuery({district: 'K'});

endpoint = endpoint.withParams({contryCode: 'CA'}) // default behavior, replaces params
    .withQuery({ ...endpoint.query, ldu: somevar});  // use spread operator to extend query

// suppose somevar is '0B1'
let codes = await endpoint.postalCodes.get(); //  {urlBase}/api/codes/postal/CA?district=K&ldu=0B1
```

#### API Endpoint Name == Route List URL Template Name

If a `$api` property name is not one of the three binding methods, the property name is assumed to be the name of a route template in `routeList`. 
The name is normalized (by default to a hyphenated-string) and the corresponding route in `routeList` is accessed.
If not found, an 'Ooops' error is thrown.
Otherwise a Proxy for the `httpHandler` object is returned, which is bound to the named route URL template.

_The http handler Proxy is the last step in the fluent builder interface. All subsequent property accesses refer to the http handler or its Proxy. 
Specifically, you cannot specify more `withParams` or `withQuery` after referencing the endpoint name._

The proxy object traps the http handler's methods `get`, `post`, `put`, `delete` and `patch`, with the usual semantics. 
Additionally, a trap is placed on the name `asLink`, which returns a resolved URL as might be used in an HTML anchor.
Other methods and property references are passed through to the underlying `httpHandler`.

### $api.$routeHelper

Exposes a copy of the route helper class used to look up and 
resolve URL paths. The helper object can be manipulated 
to change the base URL, the endpoint map, etc.

_At this time, there is no means to replace or swap the route helper instance. It may be a nice feature to point to "serverless" services on different platforms._

### $api.$httpHandler

Exposes the object configured as the http handler.

## Laravel Application Routes 

A simple Laravel project can expose the application's`routes/` route map via an API endpoint.

```php
    Route::name('application-routes')->get('application/routes', function () {
        $routes = [];

        foreach (Route::getRoutes() as $route) {
            $routes[str_replace(['.', '_'], '-', $route->getName())] = $route->uri();
        }

        return response()->json(['routes' => $routes]);
    });
```

Loading the route list from an api endpoint poses a sort of chicken-and-egg problem. 

The application must ensure that routes are loaded and the plugin is configured prior to attempting any access to `$api`. 

Alternatively, a console command can be used to export the route list as a file,
and the file included in an application bundle, merged into a static HTML page server-side, 
or read in as a static json resource.


## Contributing

Please contact the author. Fork the repo and submit a PR if you are motivated to do so!
Documentation improvements are very welcome. 
In terms of features my intention is to keep this package lean and self-contained.

## License summary

Lùxiàn is licensed under the terms of the MIT license:

Copyright (c) 2018 Mitchell Amiano

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## About the name

The author was studying standard Chinese at the time the package was conceived. 

Lùxiàn is the Pinyin spelling of a word meaning "path" or "route".
