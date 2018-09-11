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

const {createMacro} = require('babel-plugin-macros');

function BabelPluginRelayMacro({references, state, babel}) {
  const {types: t} = babel;
  Object.keys(references).forEach(referenceKey => {
    references[referenceKey].forEach(reference => {
      const path = reference.parentPath;
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(t, path, state, ast);
      }
    });
  });
}

module.exports = createMacro(BabelPluginRelayMacro);
