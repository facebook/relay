/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

let RelayConfig;
try {
  // eslint-disable-next-line no-eval
  RelayConfig = eval('require')('relay-config');
  // eslint-disable-next-line lint/no-unused-catch-bindings
} catch (_) {}

export type RelayPluginOptions = {
  // The command to run to compile Relay files, used for error messages.
  buildCommand?: string,
  // Use haste style global requires, defaults to false.
  haste?: boolean,
  // Check this global variable before validation.
  isDevVariable?: string,

  // enable generating eager es modules for modern runtime
  eagerESModules?: boolean,

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
        const config = RelayConfig && RelayConfig.loadConfig();
        path.traverse(visitor, {...state, opts: {...config, ...state.opts}});
      },
    },
  };
};
