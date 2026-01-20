/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {MultiActorStoreUpdater} from '../MultiActorEnvironmentTypes';

const RelayModernRecord = require('../../store/RelayModernRecord');
const {getActorIdentifier} = require('../ActorIdentifier');
const MultiActorEnvironment = require('../MultiActorEnvironment');

describe('commitMultiActorUpdate', () => {
  it('commits updates to all environments', () => {
    const multiActorEnvironment = new MultiActorEnvironment({
      createNetworkForActor: jest.fn(),
    });

    // Create a few environments
    const environments = [
      multiActorEnvironment.forActor(getActorIdentifier('actor1')),
      multiActorEnvironment.forActor(getActorIdentifier('actor2')),
      multiActorEnvironment.forActor(getActorIdentifier('actor3')),
    ];

    const updater = jest.fn(((actorID, env, store) => {
      store.create('foo123', 'Test').setValue(42, 'test');
    }) as MultiActorStoreUpdater);

    multiActorEnvironment.commitMultiActorUpdate(updater);
    const environmentsCalled = updater.mock.calls.map(([, env]) => env);
    const actorsCalled = updater.mock.calls.map(([actorID]) => actorID);

    environments.forEach(env => {
      expect(environmentsCalled.includes(env)).toBe(true);
      const testRecord = env.getStore().getSource().get('foo123');
      expect(testRecord).toBeTruthy();
      if (testRecord == null) {
        throw new Error('Test record is null.');
      }
      expect(testRecord).toHaveProperty('test');
      expect(RelayModernRecord.getValue(testRecord, 'test')).toBe(42);
    });

    /* $FlowFixMe[incompatible-type] Error exposed after improved typing of
     * Array.{includes,indexOf,lastIndexOf} */
    expect(actorsCalled.includes('actor1')).toBe(true);
    /* $FlowFixMe[incompatible-type] Error exposed after improved typing of
     * Array.{includes,indexOf,lastIndexOf} */
    expect(actorsCalled.includes('actor2')).toBe(true);
    /* $FlowFixMe[incompatible-type] Error exposed after improved typing of
     * Array.{includes,indexOf,lastIndexOf} */
    expect(actorsCalled.includes('actor3')).toBe(true);
  });
});
