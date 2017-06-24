/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createCompatNode
 * @flow
 * @format
 */

'use strict';

import typeof BabelTypes from 'babel-types';

/**
 * Relay Compat transforms graphql definitions into objects with `modern` and
 * `classic` keys, each containing the resulting transforms.
 */
function createCompatNode(
  t: BabelTypes,
  modernNode: Object,
  classicNode: Object,
): Object {
  return t.objectExpression([
    t.objectProperty(t.identifier('modern'), modernNode),
    t.objectProperty(t.identifier('classic'), classicNode),
  ]);
}

module.exports = createCompatNode;
