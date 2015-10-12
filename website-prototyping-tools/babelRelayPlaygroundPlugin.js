/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default function({Plugin, types: t}) {
  return new Plugin('babel-relay-playground', {
    visitor: {
      CallExpression(node) {
        var callee = this.get('callee');
        if (
          callee.matchesPattern('React.render') ||
          callee.matchesPattern('ReactDOM.render')
        ) {
          // We found a ReactDOM.render(...) type call.
          // Pluck the ReactElement from the call, and export it instead.
          return t.exportDefaultDeclaration(node.arguments[0]);
        }
      },
    },
  });
}
