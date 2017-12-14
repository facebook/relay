---
id: version-classic-installation-and-setup
title: Installation and Setup
original_id: installation-and-setup
---

## Installation

Install React and Relay using `yarn` or `npm`:

```sh
yarn add react react-dom react-relay
```

## Set up babel-plugin-relay

Relay Modern requires a Babel plugin to convert GraphQL to runtime artifacts:

```sh
yarn add --dev babel-plugin-relay
```

Add `"relay"` to the list of plugins your .babelrc file. See [the docs](./babel-plugin-relay.html) if upgrading an existing Relay app.

## Set up relay-compiler

Relay Modern's ahead-of-time compilation requires the [Relay Compiler](./relay-compiler.html):

```sh
yarn add --dev relay-compiler
```

Run the Relay Compiler after making changes to any GraphQL in your Relay application. It may be helpful to add it as a `yarn script`. Add an entry to `"scripts"` in your package.json file.

```js
"relay": "relay-compiler --src ./src --schema path/schema.graphql"
```

Then after making edits to your application files, just run `yarn run relay` to generate new files, or `yarn run relay --watch` to run the compiler as a long-lived process which automatically generates new files whenever you save.


## JavaScript environment requirements

The Relay Modern packages distributed on NPM use the widely-supported ES5
version of JavaScript to support as many browser environments as possible.

However, Relay Modern expects modern JavaScript global types (`Map`, `Set`,
`Promise`, `Object.assign`) to be defined. If you support older browsers and
devices which may not yet provide these natively, consider including a global
polyfill in your bundled application, such as [core-js][] or
[babel-polyfill](https://babeljs.io/docs/usage/polyfill/).

A polyfilled environment for Relay using [core-js][] to support older browsers
might look like:

```js
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/promise');
require('core-js/es6/object');

require('./myRelayApplication');
```

[core-js]: https://github.com/zloirock/core-js
