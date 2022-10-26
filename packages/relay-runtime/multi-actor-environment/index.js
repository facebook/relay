/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {getActorIdentifier} = require('./ActorIdentifier');
const MultiActorEnvironment = require('./MultiActorEnvironment');

export type {ActorIdentifier} from './ActorIdentifier';
export type {
  IActorEnvironment,
  IMultiActorEnvironment,
} from './MultiActorEnvironmentTypes';

module.exports = {
  MultiActorEnvironment,
  getActorIdentifier,
};
