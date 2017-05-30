/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getValidGraphQLTag
 * @format
 */

'use strict';

const GraphQL = require('graphql');

/**
 * Given a babel AST path to a tagged template literal, return an AST if it is
 * a graphql`` or graphql.experimental`` literal being used in a valid way.
 * If it is some other type of template literal then return nothing.
 */
function getValidGraphQLTag(path) {
  const tag = path.get('tag');

  const tagName = tag.isIdentifier({name: 'graphql'})
    ? 'graphql'
    : tag.matchesPattern('graphql.experimental')
        ? 'graphql.experimental'
        : undefined;

  if (!tagName) {
    return;
  }

  const quasis = path.node.quasi.quasis;

  if (quasis.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Substitutions are not allowed in ' +
        'graphql fragments. Included fragments should be referenced ' +
        'as `...MyModule_propName`.',
    );
  }

  const text = quasis[0].value.raw;

  // `graphql` only supports spec-compliant GraphQL: experimental extensions
  // such as fragment arguments are disabled
  if (tagName === 'graphql' && /@argument(Definition)?s\b/.test(text)) {
    throw new Error(
      'BabelPluginRelay: Unexpected use of fragment variables: ' +
        '@arguments and @argumentDefinitions are only supported in ' +
        'experimental mode. Source: ' +
        text,
    );
  }

  const ast = GraphQL.parse(text);

  if (ast.definitions.length === 0) {
    throw new Error('BabelPluginRelay: Unexpected empty graphql tag.');
  }

  return ast;
}

module.exports = getValidGraphQLTag;
