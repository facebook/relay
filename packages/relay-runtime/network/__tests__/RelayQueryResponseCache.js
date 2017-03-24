/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

require('configureForRelayOSS');

jest
  .autoMockOff();

const RelayQueryResponseCache = require('RelayQueryResponseCache');

describe('RelayQueryResponseCache', () => {
  let dateNow;
  let queryID;

  beforeEach(() => {
    jest.resetModules();

    dateNow = Date.now;
    queryID = '<query-id>';
  });

  afterEach(() => {
    Date.now = dateNow;
  });

  describe('clear()', () => {
    it('clears entries from the cache', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      cache.set(queryID, {id: 1}, {});
      cache.clear();
      expect(cache.get(queryID, {id: 1})).toBe(null);
    });
  });

  describe('get()', () => {
    it('returns known entries', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      const result = {};
      const variables = {id: 1};
      cache.set(queryID, variables, result);
      expect(cache.get(queryID, variables)).toBe(result);
    });

    it('returns null for unknown entries', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      cache.set(queryID, {id: 1}, {});
      expect(cache.get(queryID, {id: 2})).toBe(null);
    });

    it('expires entries', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 9});
      const result = {};
      const variables = {id: 1};
      Date.now = () => 0;
      cache.set(queryID, variables, result);
      Date.now = () => 9;
      expect(cache.get(queryID, variables)).toBe(result);
      Date.now = () => 10;
      expect(cache.get(queryID, variables)).toBe(null);
    });
  });

  describe('set()', () => {
    it('evicts the oldest entry when max size is reached', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      cache.set(queryID, {id: 1}, {});
      expect(cache.get(queryID, {id: 1})).not.toBe(null);

      cache.set(queryID, {id: 2}, {});
      expect(cache.get(queryID, {id: 1})).toBe(null);
      expect(cache.get(queryID, {id: 2})).not.toBe(null);

      cache.set(queryID, {id: 1});
      expect(cache.get(queryID, {id: 2})).toBe(null);
      expect(cache.get(queryID, {id: 1})).not.toBe(null);
    });
  });
});
