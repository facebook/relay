/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayQueryResponseCache = require('../RelayQueryResponseCache');

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
      const payload = {};
      const variables = {id: 1};
      const result = {...payload, extensions: {cacheTimestamp: 5}};
      Date.now = () => 5;
      cache.set(queryID, variables, payload);
      expect(cache.get(queryID, variables)).toEqual(result);
    });

    it('returns null for unknown entries', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      cache.set(queryID, {id: 1}, {});
      expect(cache.get(queryID, {id: 2})).toBe(null);
    });

    it('expires entries', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 9});
      const payload = {};
      const variables = {id: 1};
      const result = {...payload, extensions: {cacheTimestamp: 1}};
      Date.now = () => 1;
      cache.set(queryID, variables, payload);
      Date.now = () => 10;
      expect(cache.get(queryID, variables)).toEqual(result);
      Date.now = () => 11;
      expect(cache.get(queryID, variables)).toBe(null);
    });

    it('returns known entries for response batch', () => {
      const cache = new RelayQueryResponseCache({size: 1, ttl: 1000});
      const payload = [{}, {}];
      const variables = {id: 1};
      const result = [
        {extensions: {cacheTimestamp: 5}},
        {extensions: {cacheTimestamp: 5}},
      ];
      Date.now = () => 5;
      cache.set(queryID, variables, payload);
      expect(cache.get(queryID, variables)).toEqual(result);
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

      cache.set(queryID, {id: 1}, {});
      expect(cache.get(queryID, {id: 2})).toBe(null);
      expect(cache.get(queryID, {id: 1})).not.toBe(null);
    });
  });
});
