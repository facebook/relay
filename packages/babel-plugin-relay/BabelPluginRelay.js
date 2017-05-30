/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BabelPluginRelay
 * @format
 */

'use strict';

const compileGraphQLTag = require('./compileGraphQLTag');
const compileRelayQLTag = require('./compileRelayQLTag');
const getDocumentName = require('./getDocumentName');
const getValidGraphQLTag = require('./getValidGraphQLTag');
const getValidRelayQLTag = require('./getValidRelayQLTag');
const invariant = require('./invariant');

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
module.exports = function BabelPluginRelay({types: t}) {
  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        // Convert graphql`` literals
        const ast = getValidGraphQLTag(path);
        if (ast) {
          compileGraphQLTag(t, path, state, ast);
          return;
        }

        // Convert Relay.QL`` literals
        const [quasi, tagName, propName] = getValidRelayQLTag(path);
        if (quasi) {
          const schema = state.opts && state.opts.schema;
          invariant(
            schema,
            'babel-plugin-relay: Missing schema option. ' +
              'Check your .babelrc file or wherever you configure your Babel ' +
              'plugins to ensure the "relay" plugin has a "schema" option.\n' +
              'https://facebook.github.io/relay/docs/babel-plugin-relay.html#additional-options',
          );
          const documentName = getDocumentName(path, state);
          path.replaceWith(
            compileRelayQLTag(
              t,
              schema,
              quasi,
              documentName,
              propName,
              tagName,
              state,
            ),
          );
        }
      },
    },
  };
};
