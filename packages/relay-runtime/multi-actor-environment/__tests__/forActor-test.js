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
import type {
  GraphQLResponse,
  LogRequestInfoFunction,
  UploadableMap,
} from '../../network/RelayNetworkTypes';
import type {ObservableFromValue} from '../../network/RelayObservable';
import type {RequestParameters} from '../../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../../util/RelayRuntimeTypes';

const {create} = require('../../network/RelayNetwork');
const {getActorIdentifier} = require('../ActorIdentifier');
const MultiActorEnvironment = require('../MultiActorEnvironment');

test('forActor: creates an environment', () => {
  const actorIdentifer = getActorIdentifier('actor:1234');
  const fetchFn = jest.fn<
    [
      RequestParameters,
      Variables,
      CacheConfig,
      ?UploadableMap,
      ?LogRequestInfoFunction,
    ],
    ObservableFromValue<GraphQLResponse>,
  >();
  const multiActorEnvironment = new MultiActorEnvironment({
    createNetworkForActor: () => create(fetchFn),
    logFn: jest.fn(),
    relayFieldLogger: jest.fn(),
  });
  const actorEnvironment = multiActorEnvironment.forActor(actorIdentifer);

  expect(actorEnvironment.actorIdentifier).toBe(actorIdentifer);
  expect(actorEnvironment.multiActorEnvironment).toBe(multiActorEnvironment);
});

test('forActor: memoize an environment', () => {
  const actorIdentifer = getActorIdentifier('actor:1234');
  const fetchFn = jest.fn<
    [
      RequestParameters,
      Variables,
      CacheConfig,
      ?UploadableMap,
      ?LogRequestInfoFunction,
    ],
    ObservableFromValue<GraphQLResponse>,
  >();
  const multiActorEnvironment = new MultiActorEnvironment({
    createNetworkForActor: () => create(fetchFn),
    logFn: jest.fn(),
    relayFieldLogger: jest.fn(),
  });
  const actorEnvironment = multiActorEnvironment.forActor(actorIdentifer);

  expect(actorEnvironment.actorIdentifier).toBe(actorIdentifer);
  expect(actorEnvironment.multiActorEnvironment).toBe(multiActorEnvironment);

  const newEnvironment = multiActorEnvironment.forActor(actorIdentifer);

  expect(newEnvironment).toBe(actorEnvironment);
});

test('forActor with configName', () => {
  const multiActorEnvironment = new MultiActorEnvironment({
    createNetworkForActor: jest.fn(),
    createConfigNameForActor: actorIdentifer =>
      `Environment(${String(actorIdentifer)})`,
  });
  const actorEnvironment = multiActorEnvironment.forActor(
    getActorIdentifier('actor:1234'),
  );
  expect(actorEnvironment.configName).toBe('Environment(actor:1234)');
});

describe('forActor: renderPolicy configs', () => {
  it('should be `partial` by default', () => {
    const multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: jest.fn(),
    });
    const actorEnvironment = multiActorEnvironment.forActor(
      getActorIdentifier('actor:1234'),
    );
    expect(actorEnvironment.UNSTABLE_getDefaultRenderPolicy()).toBe('partial');
  });

  it('can be changed via config', () => {
    const multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: jest.fn(),
      defaultRenderPolicy: 'full',
    });
    const actorEnvironment = multiActorEnvironment.forActor(
      getActorIdentifier('actor:1234'),
    );
    expect(actorEnvironment.UNSTABLE_getDefaultRenderPolicy()).toBe('full');
  });
});

test('options on the environment', () => {
  const multiActorEnvironment = new MultiActorEnvironment({
    createNetworkForActor: jest.fn(),
  });
  const actorEnvironment = multiActorEnvironment.forActor(
    getActorIdentifier('actor:1234'),
  );
  expect(actorEnvironment.options).toEqual({
    actorID: 'actor:1234',
  });
});
