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

import type {DocumentNode} from 'graphql';

const GraphQL = require('graphql');

/**
 * Given a babel AST path to a tagged template literal, return an AST if it is
 * a graphql literal being used in a valid way.
 * If it is some other type of template literal then return nothing.
 */
function getValidGraphQLTag(path: any): ?DocumentNode {
  const tag = path.get('tag');

  if (!tag.isIdentifier({name: 'graphql'})) {
    return null;
  }

  const quasis = path.node.quasi.quasis;

  if (quasis.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Substitutions are not allowed in graphql fragments. ' +
        'Included fragments should be referenced as `...MyModule_propName`.',
    );
  }

  const text = quasis[0].value.raw;

  const ast = GraphQL.parse(text);

  if (ast.definitions.length === 0) {
    throw new Error('BabelPluginRelay: Unexpected empty graphql tag.');
  }

  return ast;
}

module.exports = getValidGraphQLTag;
