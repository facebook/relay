/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

const RelayDebugger = require('RelayDebugger');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayNetwork = require('RelayNetwork');
const RelayStoreUtils = require('RelayStoreUtils');

const {ID_KEY, TYPENAME_KEY} = RelayStoreUtils;

describe('RelayDebugger', () => {
  let data;
  let source;
  let store;
  let network;
  let environment;
  let relayDebugger;
  let envDebugger;
  let envId;

  beforeEach(() => {
    data = {
      abcde111: {
        fieldA: 'A',
        fieldB: 'B',
        [ID_KEY]: 'abcde111',
        [TYPENAME_KEY]: 'scratch_type',
      },
      abcde222: {
        fieldA: 'A',
        fieldB: 'A',
        [ID_KEY]: 'abcde222',
        [TYPENAME_KEY]: 'scratch_type',
      },
      abcde333: {
        fieldA: 'B',
        fieldB: 'B',
        [ID_KEY]: 'abcde333',
        [TYPENAME_KEY]: 'another_type',
      },
      abcde444: {
        fieldA: 'B',
        fieldB: 'A',
        [ID_KEY]: 'abcde444',
        [TYPENAME_KEY]: 'yet_another_type',
      },
    };
    source = new RelayInMemoryRecordSource(data);
    store = new RelayMarkSweepStore(source);
    network = RelayNetwork.create(() => {});
    environment = new RelayModernEnvironment({
      network,
      store,
    });
    relayDebugger = new RelayDebugger();
    envId = relayDebugger.registerEnvironment(environment);
    envDebugger = relayDebugger.getEnvironmentDebugger(envId);
  });

  describe('relay debugger', () => {
    it('registers environments', () => {
      expect(envId).toBeTruthy();
      const sameEnv = envDebugger.getEnvironment();
      expect(sameEnv).toEqual(environment);
      expect(relayDebugger.getRegisteredEnvironmentIds()).toContain(envId);
    });

    it('returns records', () => {
      const records = envDebugger.getMatchingRecords('', 'idtype');
      expect(records).toHaveLength(4);
    });

    it('filters records', () => {
      const records = envDebugger.getMatchingRecords('cde', 'idtype');
      expect(records).toHaveLength(4);

      const records2 = envDebugger.getMatchingRecords('cde1', 'idtype');
      expect(records2).toHaveLength(1);

      const records3 = envDebugger.getMatchingRecords('cde12', 'idtype');
      expect(records3).toHaveLength(0);

      const records4 = envDebugger.getMatchingRecords('cde12', 'type');
      expect(records4).toHaveLength(0);

      const records5 = envDebugger.getMatchingRecords('scratch_type', 'type');
      expect(records5).toHaveLength(2);
    });
  });
});
