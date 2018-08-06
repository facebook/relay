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

const isClassicRelayEnvironment = require('../classic/store/isClassicRelayEnvironment');

const {isRelayModernEnvironment} = require('relay-runtime');

import type {RelayEnvironmentInterface} from '../classic/store/RelayEnvironment';
import type {CompatEnvironment} from './react/RelayCompatTypes';
import type {IEnvironment} from 'relay-runtime';

function getRelayModernEnvironment(
  environment: CompatEnvironment,
): ?IEnvironment {
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
