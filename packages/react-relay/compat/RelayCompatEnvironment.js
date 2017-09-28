/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayCompatEnvironment
 * @flow
 * @format
 */

'use strict';

const isClassicRelayEnvironment = require('isClassicRelayEnvironment');

const {isRelayModernEnvironment} = require('RelayRuntime');

import type {CompatEnvironment} from 'RelayCompatTypes';
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {Environment} from 'RelayStoreTypes';

function getRelayModernEnvironment(
  environment: CompatEnvironment,
): ?Environment {
  if (isRelayModernEnvironment(environment)) {
    return (environment: any);
  }
}

function getRelayClassicEnvironment(
  environment: CompatEnvironment,
): ?RelayEnvironmentInterface {
  if (isClassicRelayEnvironment(environment)) {
    return (environment: any);
  }
}

module.exports = {
  getRelayClassicEnvironment,
  getRelayModernEnvironment,
};
