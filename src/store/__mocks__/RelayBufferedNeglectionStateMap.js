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
  require.requireActual('RelayBufferedNeglectionStateMap');

var forEachObject = require.requireActual('forEachObject');

class RelayBufferedNeglectionStateMap {
  constructor(innerMap) {
    var underlyingMap = new ActualRelayNeglectionStateMap(innerMap);
    forEachObject(ActualRelayNeglectionStateMap.prototype, (fn, name) => {
      this[name] = jest.genMockFunction().mockImplementation(
        fn.bind(underlyingMap)
      );
    });
    RelayBufferedNeglectionStateMap.mock.instances.push(this);
  }
}

RelayBufferedNeglectionStateMap.mock = {
  instances: [],
};

module.exports = RelayBufferedNeglectionStateMap;
