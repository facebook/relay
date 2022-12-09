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

// Enforces Flow's no-mixed-import-and-require config. Useful for code that gets
// synced into a place where that Flow config is enabled.
module.exports = {
  meta: {
    type: 'problem',
    messages: {
      noMixedImportAndRequire:
        "Unexpected combination of require and import within a single module. This is incompatible with Flow's no-mixed-import-and-require config.",
    },
    schema: [],
  },

  create(context) {
    let requireUse = null;
    let importUse = null;
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require'
        ) {
          requireUse = node;
        }
      },
      ImportDeclaration(node) {
        if (node.importKind !== 'type' && node.importKind !== 'typeof') {
          importUse = node;
        }
      },
      'Program:exit'() {
        if (requireUse != null && importUse != null) {
          context.report({
            messageId: 'noMixedImportAndRequire',
            node: importUse,
          });
        }
      },
    };
  },
};
