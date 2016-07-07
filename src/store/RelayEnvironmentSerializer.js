/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironmentSerializer
 * @flow
 */

'use strict';

const RelayEnvironment = require('RelayEnvironment');
const RelayStoreData = require('RelayStoreData');

const RelayEnvironmentSerializer = {
  serialize(relayEnvironment: RelayEnvironment): string {
    return JSON.stringify(relayEnvironment.getStoreData());
  },

  deserialize(str: string): RelayEnvironment {
    return new RelayEnvironment(RelayStoreData.fromJSON(JSON.parse(str)));
  },
};

module.exports = RelayEnvironmentSerializer;
