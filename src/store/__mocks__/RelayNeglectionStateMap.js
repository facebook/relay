/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ActualRelayNeglectionStateMap =
  require.requireActual('RelayNeglectionStateMap');

var forEachObject = require.requireActual('forEachObject');

class RelayNeglectionStateMap {
  constructor() {
    var underlyingMap = new ActualRelayNeglectionStateMap();
    forEachObject(ActualRelayNeglectionStateMap.prototype, (fn, name) => {
      this[name] = jest.genMockFunction().mockImplementation(
        fn.bind(underlyingMap)
      );
    });
    RelayNeglectionStateMap.mock.instances.push(this);
  }
}

RelayNeglectionStateMap.mock = {
  instances: [],
};

module.exports = RelayNeglectionStateMap;
