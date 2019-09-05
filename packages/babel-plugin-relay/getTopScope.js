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

function getTopScope(path: Object): Object {
  let topScope = path.scope;
  while (topScope.parent) {
    topScope = topScope.parent;
  }
  return topScope;
}

module.exports = getTopScope;
