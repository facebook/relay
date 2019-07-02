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
const compileRelayQLTag = require('./compileRelayQLTag');
const getDocumentName = require('./getDocumentName');
const getValidGraphQLTag = require('./getValidGraphQLTag');
const getValidRelayQLTag = require('./getValidRelayQLTag');
const invariant = require('./invariant');

let RelayConfig;
try {
  // eslint-disable-next-line no-eval
  RelayConfig = eval('require')('relay-config');
  // eslint-disable-next-line lint/no-unused-catch-bindings
} catch (_) {}

import type {Validator} from './RelayQLTransformer';

export type RelayPluginOptions = {
  // The command to run to compile Relay files, used for error messages.
  buildCommand?: string,

  // Use haste style global requires, defaults to false.
  haste?: boolean,

  // Enable compat mode compiling for modern and classic runtime.
  compat?: boolean,

  // Check this global variable before validation.
  isDevVariable?: string,

  // Classic options
  inputArgumentName?: string,
  schema?: string,
  snakeCase?: boolean,
  substituteVariables?: boolean,
  validator?: Validator<any>,
  // Directory as specified by artifactDirectory when running relay-compiler
  artifactDirectory?: string,
};

export type BabelState = {
  file?: any,
  opts?: RelayPluginOptions,
};

/**
 * Using babel-plugin-relay with only the modern runtime?
 *
 *     {
 *       plugins: [
 *         "relay"
 *       ]
 *     }
 *
 * Using babel-plugin-relay in compatability or classic mode?
 *
 *     {
 *       plugins: [
 *         ["relay", {"compat": true, "schema": "path/to/schema.graphql"}]
 *       ]
 *     }
 *
 */
module.exports = function BabelPluginRelay(context: {types: $FlowFixMe}): any {
  const {types: t} = context;
  if (!t) {
    throw new Error(
      'BabelPluginRelay: Expected plugin context to include "types", but got:' +
        String(context),
    );
  }

  const visitor = {
    TaggedTemplateExpression(path, state) {
      // Convert graphql`` literals
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(t, path, state, ast);
        return;
      }

      // Convert graphql_DEPRECATED`` literals
      const deprecatedAst = getValidGraphQLTag(path, 'graphql_DEPRECATED');
      if (deprecatedAst != null) {
        compileGraphQLTag(t, path, state, deprecatedAst, /* deprecated */ true);
        return;
      }

      // Convert Relay.QL`` literals
      const [quasi, tagName, propName] = getValidRelayQLTag(path);
      if (quasi && tagName) {
        const schema = state.opts && state.opts.schema;
        invariant(
          schema,
          'babel-plugin-relay: Missing schema option. ' +
            'Check your .babelrc file or wherever you configure your Babel ' +
            'plugins to ensure the "relay" plugin has a "schema" option.\n' +
            'https://relay.dev/docs/en/installation-and-setup#set-up-babel-plugin-relay',
        );
        const documentName = getDocumentName(path, state);
        path.replaceWith(
          compileRelayQLTag(
            t,
            path,
            schema,
            quasi,
            documentName,
            propName,
            tagName,
            true, // enableValidation
            state,
          ),
        );
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
