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

const RelayEnvironment = require('./RelayEnvironment');
const RelayStoreData = require('./RelayStoreData');

const RelayEnvironmentSerializer = {
  serialize(relayEnvironment: RelayEnvironment): string {
    return JSON.stringify(relayEnvironment.getStoreData());
  },

  deserialize(str: string): RelayEnvironment {
    return new RelayEnvironment(RelayStoreData.fromJSON(JSON.parse(str)));
  },
};

module.exports = RelayEnvironmentSerializer;
