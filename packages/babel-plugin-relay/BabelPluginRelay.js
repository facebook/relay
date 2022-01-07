/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const compileGraphQLTag = require('./compileGraphQLTag');
const getValidGraphQLTag = require('./getValidGraphQLTag');
const cosmiconfig = require('cosmiconfig');

const configExplorer = cosmiconfig('relay', {
  searchPlaces: ['relay.config.js', 'relay.config.json', 'package.json'],
  loaders: {
    '.json': cosmiconfig.loadJson,
    '.js': cosmiconfig.loadJs,
    noExt: cosmiconfig.loadYaml,
  },
});

let RelayConfig;
const result = configExplorer.searchSync();
if (result) {
  RelayConfig = result.config;
}

export type RelayPluginOptions = {
  // The command to run to compile Relay files, used for error messages.
  codegenCommand?: string,

  // Formatting style for generated files. `commonjs` or `haste`.
  // Default is `commonjs`.
  jsModuleFormat?: string,

  // Name of the global variable for dev mode
  isDevVariableName?: string,

  // enable generating eager es modules for modern runtime
  eagerEsModules?: boolean,

  // Directory as specified by artifactDirectory when running relay-compiler
  artifactDirectory?: string,
  ...
};

export type BabelState = {
  file?: any,
  opts?: RelayPluginOptions,
  ...
};

/**
 * Using babel-plugin-relay with only the modern runtime?
 *
 *     {
 *       plugins: [
 *         "relay"
 *       ]
 *     }
 */
module.exports = function BabelPluginRelay(context: {
  types: $FlowFixMe,
  ...
}): any {
  const {types: t} = context;
  if (!t) {
    throw new Error(
      'BabelPluginRelay: Expected plugin context to include "types", but got:' +
        String(context),
    );
  }

  const visitor = {
    TaggedTemplateExpression(path: any, state: BabelState) {
      // Convert graphql`` literals
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(t, path, state, ast);
        return;
      }
    },
  };

  return {
    visitor: {
      Program(path, state) {
        path.traverse(visitor, {
          ...state,
          opts: {...RelayConfig, ...state.opts},
        });
      },
    },
  };
};
