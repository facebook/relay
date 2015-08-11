// Copyright 2004-present Facebook. All Rights Reserved.

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
