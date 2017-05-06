/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule filterContextForNode
 * @flow
 * @format
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');

const {visit} = require('RelayIRVisitor');

import type {Fragment, FragmentSpread, Root} from 'RelayIR';

/**
 * Returns a RelayCompilerContext containing only the documents referenced
 * by and including the provided node.
 */
function filterContextForNode(
  node: Fragment | Root,
  context: RelayCompilerContext,
): RelayCompilerContext {
  const queue = [node];
  let filteredContext = new RelayCompilerContext(context.schema).add(node);
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
