---
id: installation-and-setup
title: Installing in a Project
slug: /getting-started/installation-and-setup/
description: Relay installation and setup guide
keywords:
- installation
- setup
- compiler
- babel-plugin-relay
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

# Installation

In many situations, the easiest way to install Relay is with the `create-relay-app` package written by Tobias Tengler. Contrary to what the name suggests, this package *installs* Relay on your existing app.

It currently supports apps built on Next, Vite, and Create React App. If you aren't on one of those platforms, or if it doesn't work for you for some reason, proceed to the manual steps below.

To run it, make sure you have a clean working directory and run:

```
npm create @tobiastengler/relay-app
```

(or use `yarn` or `pnpm` instead of `npm` as you prefer).

When it's done it will print some "Next Steps" for you to follow.

More details about this script can be found at its [GitHub repository](https://github.com/tobias-tengler/create-relay-app).

* * *

# Manual Installation

Install React and Relay using `yarn` or `npm`:

```sh
yarn add react react-dom react-relay
```

## Set up the compiler

Relay's ahead-of-time compilation requires the [Relay Compiler](../../guides/compiler/), which you can install via `yarn` or `npm`:

```sh
yarn add --dev relay-compiler
```

This installs the bin script `relay-compiler` in your node_modules folder. It's recommended to run this from a `yarn`/`npm` script by adding a script to your `package.json` file:

```js
"scripts": {
  "relay": "relay-compiler"
}
```

## Compiler configuration

Create the configuration file:

```javascript
// relay.config.js
module.exports = {
  // ...
  // Configuration options accepted by the `relay-compiler` command-line tool and `babel-plugin-relay`.
  src: "./src",
  language: "javascript", // "javascript" | "typescript" | "flow"
  schema: "./data/schema.graphql",
  excludes: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
}
```

This configuration also can be specified in `"relay"` section of the `package.json` file.
For more details, and configuration options see: [Relay Compiler Configuration](https://github.com/facebook/relay/tree/main/packages/relay-compiler)


## Set up babel-plugin-relay

Relay requires a Babel plugin to convert GraphQL to runtime artifacts:

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
Babel's [documentation on this topic](https://babeljs.io/docs/plugins/#pluginpreset-ordering).

Alternatively, instead of using `babel-plugin-relay`, you can use Relay with [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros). After installing `babel-plugin-macros` and adding it to your Babel config:

```javascript
const graphql = require('babel-plugin-relay/macro');
```

## Running the compiler

After making edits to your application files, just run the `relay` script to generate new compiled artifacts:

```sh
yarn run relay
```

Alternatively, you can pass the `--watch` option to watch for file changes in your source code and automatically re-generate the compiled artifacts (**Note:** Requires [watchman](https://facebook.github.io/watchman) to be installed):

```sh
yarn run relay --watch
```

For more details, check out our [Relay Compiler docs](../../guides/compiler/).

## JavaScript environment requirements

The Relay packages distributed on NPM use the widely-supported ES5
version of JavaScript to support as many browser environments as possible.

However, Relay expects modern JavaScript global types (`Map`, `Set`,
`Promise`, `Object.assign`) to be defined. If you support older browsers and
devices which may not yet provide these natively, consider including a global
polyfill in your bundled application, such as [core-js][] or
[@babel/polyfill](https://babeljs.io/docs/usage/polyfill/).

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


<DocsRating />
