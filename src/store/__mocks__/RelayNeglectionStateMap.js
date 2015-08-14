// Copyright 2004-present Facebook. All Rights Reserved.

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
  instances: []
};

module.exports = RelayNeglectionStateMap;
