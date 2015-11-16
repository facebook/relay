/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStore
 * @typechecks
 */

'use strict';

var RelayContext = require('RelayContext');
var RelayStoreData = require('RelayStoreData');

var warning = require('warning');

var _relayStore = new RelayContext(new RelayStoreData());

for (var propName in _relayStore) {
  var oldFn = _relayStore[propName];
  if (!_relayStore.hasOwnProperty(propName) || !typeof oldFn !== 'function') {
    continue;
  }
  _relayStore[propName] = function(...args) {
    warning(
      true,
      'RelayStore: Using RelayStore as a singleton (e.g. Relay.Store.%s) is ' +
      'deprecated. Set `relayContext` on your RelayRenderer and call ' +
      '`this.props.relay.%s` instead.',
      propName,
      propName
    );
    return oldFn.call(_relayStore, args);
  };
}

module.exports = _relayStore;
