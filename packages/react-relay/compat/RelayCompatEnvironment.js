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
const isRelayContext = require('isRelayContext');
const isRelayStaticContext = require('isRelayStaticContext');
const {isRelayStaticEnvironment} = require('RelayRuntime');

import type {CompatContext} from 'RelayCompatTypes';
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {Environment} from 'RelayStoreTypes';

function getRelayStaticEnvironment(context: CompatContext): ?Environment {
  if (isRelayStaticContext(context)) {
    return (context: any).environment;
  } else if (isRelayStaticEnvironment(context)) {
    return (context: any);
  }
}

function getRelayClassicEnvironment(context: CompatContext): ?RelayEnvironmentInterface {
  if (
    isRelayContext(context) &&
    isClassicRelayEnvironment((context: any).environment)
  ) {
    return (context: any).environment;
  } else if (isClassicRelayEnvironment(context)) {
    return (context: any);
  }
}

module.exports = {
  getRelayClassicEnvironment,
  getRelayStaticEnvironment,
};
