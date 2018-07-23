/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('./GraphQLCompilerContext');

const {visit} = require('./GraphQLIRVisitor');

import type {Fragment, FragmentSpread, Root} from './GraphQLIR';

/**
 * Returns a GraphQLCompilerContext containing only the documents referenced
 * by and including the provided node.
 */
function filterContextForNode(
  node: Fragment | Root,
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  const queue = [node];
  let filteredContext = new GraphQLCompilerContext(
    context.serverSchema,
    context.clientSchema,
  ).add(node);
  const visitorConfig = {
    FragmentSpread: (fragmentSpread: FragmentSpread) => {
      const {name} = fragmentSpread;
      if (!filteredContext.get(name)) {
        const fragment = context.getFragment(name);
        filteredContext = filteredContext.add(fragment);
        queue.push(fragment);
      }
    },
  };
  while (queue.length) {
    visit(queue.pop(), visitorConfig);
  }
  return filteredContext;
}

module.exports = filterContextForNode;
