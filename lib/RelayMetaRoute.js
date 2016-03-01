/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMetaRoute
 * 
 * @typechecks
 */

'use strict';

/**
 * Meta route based on the real route; provides access to the route name in
 * queries.
 */

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var RelayMetaRoute = (function () {
  function RelayMetaRoute(name) {
    _classCallCheck(this, RelayMetaRoute);

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: name,
      writable: false
    });
  }

  RelayMetaRoute.get = function get(name) {
    return cache[name] || (cache[name] = new RelayMetaRoute(name));
  };

  return RelayMetaRoute;
})();

var cache = {};

module.exports = RelayMetaRoute;