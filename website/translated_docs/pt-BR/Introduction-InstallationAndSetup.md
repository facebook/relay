---
id: installation-and-setup
title: Instalação e configuração
---

## Instalação

Instale React e Relay usando `yarn` ou `npm`:

```sh

yarn add react react-dom react-relay

```

## Configurando Relay com um arquivo de configuração

A configuração abaixo do `babel-plugin-relay` e `relay-compiler` pode ser aplicada usando um arquivo de configuração através do pacote `relay-config`. Além de unificar toda a configuração do relé em um único lugar, outras ferramentas podem aproveitar isso para fornecer configuração zero (por exemplo, [ vscode-apollo-relay ](https://github.com/relay-tools/vscode-apollo-relay)).

Instale o pacote:

```sh

yarn add --dev relay-config

```

E crie o arquivo de configuração:

```javascript

// relay.config.js
module.exports = {
  // ...
  // Opções de configuração aceitas pelo `relay-compiler` command-line tool e `babel-plugin-relay`.
  src: "./src",
  schema: "./data/schema.graphql",
  exclude: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
}

```

## Configurando babel-plugin-relay

Relay Modern requires a Babel plugin to convert GraphQL to runtime artifacts:

```sh

yarn add --dev babel-plugin-relay graphql

```

Adicionar `"relay"` na lista de plugins do seu arquivo `.babelrc`:

```javascript

{
  "plugins": [
    "relay"
  ]
}

```

Please note that the `"relay"` plugin should run before other plugins or presets to ensure the `graphql` template literals are correctly transformed. See Babel's [documentation on this topic](https://babeljs.io/docs/plugins/#pluginpreset-ordering).

Alternatively, instead of using `babel-plugin-relay`, you can use Relay with [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros). After installing `babel-plugin-macros` and adding it to your Babel config:

```javascript

const graphql = require('babel-plugin-relay/macro');

```

If you need to configure `babel-plugin-relay` further (e.g. to enable `compat` mode), you can do so by [specifying the options in a number of ways](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md#config-experimental).

Por exemplo:

```javascript

// babel-plugin-macros.config.js
module.exports = {
  // ...
  // Other macros config
  relay: {
    compat: true,
  },
}

```

## Configurando relay-compiler

Relay's ahead-of-time compilation requires the [Relay Compiler](./graphql-in-relay.html#relay-compiler), which you can install via `yarn` or `npm`:

```sh

yarn add --dev relay-compiler

```

This installs the bin script `relay-compiler` in your node_modules folder. It's recommended to run this from a `yarn`/`npm` script by adding a script to your `package.json` file:

```js

"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql"
}

```

ou se você estiver usando jsx:

```js

"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --extensions js jsx"
}

```

Then, after making edits to your application files, just run the `relay` script to generate new compiled artifacts:

```sh

yarn run relay

```

Alternatively, you can pass the `--watch` option to watch for file changes in your source code and automatically re-generate the compiled artifacts (**Note:** Requires [watchman](https://facebook.github.io/watchman) to be installed):

```sh

yarn run relay --watch

```

Para mais detalhes, verifique nossa [documentação do Relay Compiler](./graphql-in-relay.html#relay-compiler).

## Requisitos de ambiente JavaScript

Os pacotes Relay Modern distribuídos no NPM utilizam o amplamente apoiado ES5 versão do JavaScript feito para suportar o maior número possível de ambientes de navegação.

Contudo, o Relay Modern espera tipos globais modernos de JavaScript (`Map`, `Set`, `Promise`, `Object.assign`) a serem definidos. Se suporta navegadores mais antigos e dispositivos que podem ainda não os fornece nativamente, considere a inclusão de um polyfill na sua aplicação agrupada, tais como [core-js][] ou [@babel/polyfill](https://babeljs.io/docs/usage/polyfill/).

A polyfilled environment for Relay using [core-js][] to support older browsers might look like:

```js

require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/promise');
require('core-js/es6/object');

require('./myRelayApplication');

```

[core-js]: https://github.com/zloirock/core-js
