/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const MultiActorEnvironment = require('../MultiActorEnvironment');

const {create} = require('../../network/RelayNetwork');

jest.mock('../ActorIdentifier', () => {
  return {
    getDefaultActorIdentifier: jest.fn(() => {
      return 'actor:12345';
    }),
  };
});

const {getDefaultActorIdentifier} = require('../ActorIdentifier');

test('forActor: creates an environment', () => {
  const actorIdentifer = getDefaultActorIdentifier();
  const fetchFn = jest.fn();
  const multiActorEnvrionment = new MultiActorEnvironment({
    createNetworkForActor: () => create(fetchFn),
    logFn: jest.fn(),
    requiredFieldLogger: jest.fn(),
  });
  const actorEnvironment = multiActorEnvrionment.forActor(actorIdentifer);

  expect(actorEnvironment.actorIdentifier).toBe(actorIdentifer);
  expect(actorEnvironment.multiActorEnvironment).toBe(multiActorEnvrionment);
});

test('forActor: memoize an environment', () => {
  const actorIdentifer = getDefaultActorIdentifier();
  const fetchFn = jest.fn();
  const multiActorEnvrionment = new MultiActorEnvironment({
    createNetworkForActor: () => create(fetchFn),
    logFn: jest.fn(),
    requiredFieldLogger: jest.fn(),
  });
  const actorEnvironment = multiActorEnvrionment.forActor(actorIdentifer);

  expect(actorEnvironment.actorIdentifier).toBe(actorIdentifer);
  expect(actorEnvironment.multiActorEnvironment).toBe(multiActorEnvrionment);

  const newEnvironment = multiActorEnvrionment.forActor(actorIdentifer);

  expect(newEnvironment).toBe(actorEnvironment);
});
