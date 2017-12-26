/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
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
