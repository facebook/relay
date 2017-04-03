/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BabelPluginRelay
 */

'use strict';

const {
  compileGraphQLTag,
  getValidGraphQLTag,
} = require('./GraphQLTagCompiler');

/**
 * Using babel-plugin-relay with only the modern runtime?
 *
 *     {
 *       plugins: [
 *         ["relay", {"modernOnly": true}]
 *       ]
 *     }
 *
 * Using babel-plugin-relay in compatability mode?
 *
 *     {
 *       plugins: [
 *         "relay"
 *       ]
 *     }
 *
 */
module.exports = function BabelPluginRelay({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        const ast = getValidGraphQLTag(path);
        if (ast) {
          compileGraphQLTag(t, path, state, ast);
          return;
        }
      },
    },
  };
};
