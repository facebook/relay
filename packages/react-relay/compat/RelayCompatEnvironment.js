/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompatEnvironment
 * @flow
 */

'use strict';

const isClassicRelayEnvironment = require('isClassicRelayEnvironment');

const {isRelayModernEnvironment} = require('RelayRuntime');

import type {CompatEnvironment} from 'RelayCompatTypes';
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {Environment} from 'RelayStoreTypes';

function getRelayModernEnvironment(environment: CompatEnvironment): ?Environment {
  if (isRelayModernEnvironment(environment)) {
    return (environment: any);
  }
}

function getRelayClassicEnvironment(environment: CompatEnvironment): ?RelayEnvironmentInterface {
  if (isClassicRelayEnvironment(environment)) {
    return (environment: any);
  }
}

module.exports = {
  getRelayClassicEnvironment,
  getRelayModernEnvironment,
};
