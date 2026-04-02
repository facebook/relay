/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall eslint
 */

'use strict';

/**
 * When an ESM file imports a common js file (like relay-runtime), Node.js will
 * use cjs-module-lexer (https://github.com/nodejs/cjs-module-lexer/) to try
 * to determine compatible named exports.
 *
 * From the node.js docs (https://nodejs.org/api/esm.html):
 * > Named exports detection covers many common export patterns, reexport
 * > patterns and build tool and transpiler outputs. See cjs-module-lexer
 * > for the exact semantics implemented.
 *
 * In the entry points of react-relay and relay-runtime, the pattern of
 * exporting a property on another object causes cjs-module-lexer to not
 * detect any subsequent named exports.
 *
 * Example:
 *
 * This doesn't work
 * module.exports = {
 *   fetchQuery: RelayRuntime.fetchQuery
 * };
 *
 * This does work
 * const { fetchQuery } = RelayRuntime;
 * module.exports = {
 *   fetchQuery
 * };
 *
 * This rule enforces that relay's entry files can be used with ESM named exports.
 *
 */

module.exports = {
  meta: {
    type: 'problem',
    messages: {
      esmCompatibleCjs:
        "Relay's entry files must be compatible with ESM named exports, use a simple identifier assignment.",
    },
    schema: [],
  },

  create(context) {
    const invalidExports = [];
    return {
      ExpressionStatement(node) {
        if (
          node.expression.type === 'AssignmentExpression' &&
          node.expression.left.object.type === 'Identifier' &&
          node.expression.left.object.name === 'module' &&
          node.expression.left.property.type === 'Identifier' &&
          node.expression.left.property.name === 'exports' &&
          node.expression.right.type === 'ObjectExpression'
        ) {
          for (const property of node.expression.right.properties) {
            if (property.value.type !== 'Identifier') {
              invalidExports.push(property.value);
            }
          }
        }
      },
      'Program:exit'() {
        if (invalidExports.length > 0) {
          for (const invalidExport of invalidExports) {
            context.report({
              messageId: 'esmCompatibleCjs',
              node: invalidExport,
            });
          }
        }
      },
    };
  },
};
