/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const path = require('path');

function babelAdapter(
  Plugin: ?Function,
  t: any,
  babelVersion: string,
  name: string,
  visitorsBuilder: (t: any) => {
    visitor: {
      [key: string]: Function;
    };
  }
): mixed {
  if (Plugin == null || /^6\./.test(babelVersion)) {
    // Babel 6.
    return visitorsBuilder(t);
  }
  // Babel 5.
  const legacyT = {
    ...t,
    nullLiteral: () => t.literal(null),
    valueToNode: (value) => t.literal(value),
    objectProperty: (ident, value) => t.property('init', ident, value),
  };

  const visitors = visitorsBuilder(legacyT).visitor;
  const legacyVisitors = {};
  Object.keys(visitors).forEach(key => {
    legacyVisitors[key] = function(node, parent, scope, state) {
      const compatPath = {
        get: (...args) => this.get(...args),
        node,
        parent,
      };
      let compatState = state.opts.compatState;
      if (!compatState) {
        const filename = state.opts.filename;
        state.opts.compatState = compatState = {
          file: {
            code: state.code != null ?
              state.code :
              state.file.code,
            opts: {
              basename: path.basename(filename, path.extname(filename)),
              filename,
            },
          },
          isLegacyState: true,
        };
      }
      return visitors[key](compatPath, compatState);
    };
  });
  return new Plugin(name, {visitor: legacyVisitors});
}

module.exports = babelAdapter;
