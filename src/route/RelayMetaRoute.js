/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMetaRoute
 * @flow
 */

'use strict';

/**
 * Meta route based on the real route; provides access to the route name in
 * queries.
 */
class RelayMetaRoute {
  name: string;

  constructor(name: string) {
    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: name,
      writable: false,
    });
  }

  static get(name: string) {
    return cache[name] || (cache[name] = new RelayMetaRoute(name));
  }

}

const cache: {[key: string]: RelayMetaRoute} = {};

module.exports = RelayMetaRoute;
