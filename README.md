# 路线 Lùxiàn


Lùxiàn is syntactic sugar for working with named, parameterized route endpoint URLs within a Vue application.

## Abstract - 路线制作 Lùxiàn zhìzuò - Route production

Lùxiàn is a Vue plugin to make it easy to formulate URL endpoint requests.

Lùxiàn provides a route resolver similar to the `route` helpers provided in MVC
frameworks such as Ruby on Rails or Laravel.

It is a good practice to avoid sprinkling in hard-coded resource
locations throughout source code.  Simple configuration tactics such as
dot files and route maps can avoid unnecessary direct dependencies
on fixed URL paths. Lùxiàn brings these configuration items forward
into the client code, making it easy to use symbolic names and
parameters rather than fixing the URI paths in code.


## Quickstart

Get a feel for how it works using a CodePen

**TODO**



## Installing and Configuration

You can install Lùxiàn via `npm install luxian` or `yarn add luxian`

*The package and file names use non-accented characters.*

```
import Luxian from 'luxian';

const luxian = new Luxian(options);

Vue.use(luxian);
```

**TODO** Specify the options: url map, http handler, services' base urls.

**Caveat** the current prototyped code embeds Axios as the HTTP handler.  This dependency aught to be made more distinct or at least more configurable.

**Caveat** the current prototyped code assumes one base url, and knows nothing of other services.

## Usage Synopsis

### $api

Lùxiàn exposes an `$api` property to all components. Call your API
endpoints by name, optionally attaching URL path segment parameters,
query string arguments, or URL document fragment identifiers.

```
this.$api
    .withParams(paramsObject)

    .withQuery(queryArgsObject)

    .withFragment(fragmentString)

    .yourOwnAPIEnpointNameHere

    .post(payloadObject)

    .then(successCallback)

    .catch(failureCallback)

    .finally(cleanupCallback)
```

The `$api` property is a Javascript `Proxy` object which takes any
arbitrary property name.

If the name is one of the binding methods (`withParams`, `withQuery`,
or `withFragment`), a new Proxy is returned which is bound to the given argument.
The `withParams` and `withQuery` each accept an Object, whose keys and
values correspond to URL parameters or query string arguments.
The `withFragment` appends its String argument as a `#docfragment` to
the end of a fully resolved URL.

**TODO** withFragment is not yet written

If the name is not one of the three binding methods, the name is
resolved via a map of API endpoints. The endpoint map is configured
either at compile-time via the initialization options, or dynamically
via a callback at runtime.

Lùxiàn then returns an HTTP handler attached to the given endpoint.

**TODO** **Caveat** By default, this will be a simple JS Object wrapper around a Axios object,
which exposes HTTP methods `get`, `post`, `delete`, and `put`. This
wrapper should either be complete, or be removed.

### $makeUrl

**TODO** still fiddling with the naming and signature of this feature.
$makeUrl, $urlTo.route('name',params,qs,frag) ... ?

The plugin also exposes a `$makeUrl` property, which allows client code
to resolve URL paths directly, without wrapping with an HTTP handler.
The helper object can also be manipulated to change the base URL, the
endpoint map, etc.


### Examples

```
this.$api.withParams({ zip: '08816' }).zip_codes.get().then((result) =>
{
    this.doSomethingWithZipCodes(result);
}).catch((problems)=> {
    this.$emit('app-error', problems);
})
```

```
this.$api.student_survey.post({ payload... }).then( 
   ... and so forth ...

this.$api.withQuery({ search: { course: 'NE 453' }}).student_survey.get({ payload... }).then( 
   ... and so on ...
```

Where `zip_codes` and `student_survey` are both named API endpoints with
known parameters.


## Contributing

TBD

TBD guidance for contributors

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

Lùxiàn is the Pinyin spelling of the standard Chinese word meaning "Route".
