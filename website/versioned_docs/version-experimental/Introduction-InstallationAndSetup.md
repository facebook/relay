---
id: installation-and-setup
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

yarn add --dev babel-plugin-relay graphql

```

Add `"relay"` to the list of plugins your `.babelrc` file:

```javascript
{
  "plugins": [
    "relay"
  ]
}
```

Please note that the `"relay"` plugin should run before other plugins or
presets to ensure the `graphql` template literals are correctly transformed. See
Babel's [documentation on this topic](https://babeljs.io/docs/plugins/#plugin-preset-ordering).

## Set up relay-compiler

Relay's ahead-of-time compilation requires the [Relay Compiler](./graphql-in-relay#relay-compiler), which you can install via `yarn` or `npm`:

```sh

yarn add --dev relay-compiler graphql

```

This installs the bin script `relay-compiler` in your node_modules folder. It's recommended to run this from a `yarn`/`npm` script by adding a script to your `package.json` file:

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql"
}
```

Then, after making edits to your application files, just run the `relay` script to generate new compiled artifacts:

```sh

yarn run relay

```

Alternatively, you can pass the `--watch` option to watch for file changes in your source code and automatically re-generate the compiled artifacts (**Note:** Requires [watchman](https://facebook.github.io/watchman) to be installed):

```sh

yarn run relay -- --watch

```

For more details, check out our [Relay Compiler docs](./graphql-in-relay#relay-compiler).

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

```javascript
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/promise');
require('core-js/es6/object');

require('./myRelayApplication');
```

[core-js]: https://github.com/zloirock/core-js
