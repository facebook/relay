/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getValidRelayQLTag
 * @flow
 * @format
 */

'use strict';

/**
 * Given a TemplateLiteral path, return the metadata about a RelayQL tag
 * if one exists.
 */
function getValidRelayQLTag(path: any): [any, ?string, ?string] {
  const {node} = path;

  const tag = path.get('tag');
  const tagName = tag.matchesPattern('Relay.QL')
    ? 'Relay.QL'
    : tag.matchesPattern('RelayClassic.QL')
        ? 'RelayClassic.QL'
        : tag.isIdentifier({name: 'RelayQL'}) ? 'RelayQL' : null;
  if (!tagName) {
    return [null, null, null];
  }

  let p = path;
  let propName = null;
  while (!propName && (p = p.parentPath)) {
    if (p.isProperty()) {
      propName = p.node.key.name;
    }
  }

  return [node.quasi, tagName, propName];
}

module.exports = getValidRelayQLTag;
