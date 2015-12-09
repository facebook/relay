/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayNeglectionStateMap = require('RelayNeglectionStateMap');
var RelayTestUtils = require('RelayTestUtils');

describe('RelayNeglectionStateMap', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('is empty on creation', () => {
    var map = new RelayNeglectionStateMap();
    expect(map.size()).toBe(0);
  });

  it('can register DataIDs', () => {
    var map = new RelayNeglectionStateMap();
    expect(map.size()).toBe(0);
    map.register('a');
    expect(map.size()).toBe(1);
  });

  it(
    'throws an exception when trying to decrease number of subscriptions on ' +
    'unregistered data', () => {
      var map = new RelayNeglectionStateMap();
      expect(() => map.decreaseSubscriptionsFor('a')).toFailInvariant(
        'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
        'decrease subscriptions for unregistered record `a`.'
      );
    }
  );

  it('throws an exception when decreasing subscriptions below 0', () => {
    var map = new RelayNeglectionStateMap();
    map.register('a');
    expect(() => map.decreaseSubscriptionsFor('a')).toFailInvariant(
      'RelayNeglectionStatesMap.decreaseSubscriptionsFor(): Cannot ' +
      'decrease subscriptions below 0 for record `a`.'
    );
  });

  it(
    'implicitly registers dataIDs with a subscriptions-count of one when ' +
    'increasing the number of subscriptions',
    () => {
      var map = new RelayNeglectionStateMap();
      expect(map.size()).toBe(0);
      map.increaseSubscriptionsFor('a');
      expect(map.size()).toBe(1);
      expect(
        () => map.decreaseSubscriptionsFor('a')
      ).not.toThrow();
    }
  );

  it(
    'does not reset the subscriptions to 0 if a dataID is registered after ' +
    'it was implicitly registered through `increaseSubscriptionsFor`',
    () => {
      var map = new RelayNeglectionStateMap();
      map.increaseSubscriptionsFor('a');
      map.register('a');
      expect(
        () => map.decreaseSubscriptionsFor('a')
      ).not.toThrow();
    }
  );

  it('increases the number of subscriptions for registered data', () => {
    var map = new RelayNeglectionStateMap();
    map.register('a');
    map.increaseSubscriptionsFor('a');
    // We increased once, so we can decrease once
    expect(() => map.decreaseSubscriptionsFor('a')).not.toThrow();
  });

  it('decreases the number of subscriptions for registered data', () => {
    var map = new RelayNeglectionStateMap();
    map.register('a');
    map.increaseSubscriptionsFor('a');
    map.decreaseSubscriptionsFor('a');
    // We increased once and decreased once, we are back at 0, next attempt to
    // decrease should fail
    expect(() => map.decreaseSubscriptionsFor('a')).toThrow();
  });

  it('remove a element from the store', () => {
    var map = new RelayNeglectionStateMap();
    map.register('a');
    expect(map.size()).toBe(1);
    map.remove('a');
    expect(map.size()).toBe(0);
  });

  describe('iterators', () => {
    var neglectionStateA;
    var neglectionStateB;

    beforeEach(() => {
      neglectionStateA = {
        dataID: 'a',
        collectible: false,
        generations: 0,
        subscriptions: 0,
      };

      neglectionStateB = {
        dataID: 'b',
        collectible: false,
        generations: 0,
        subscriptions: 1,
      };
    });

    it(
      'provides an iterator over the stored data sorted ascending by the ' +
      'number of subscriptions',
      () => {
        // Ensure that A should come before B
        var map = new RelayNeglectionStateMap();
        // Insert in reverse order
        map.register('b');
        map.register('a');
        map.increaseSubscriptionsFor('b');
        var iter = map.values();
        // A is the first element even though it was inserted last
        var first = iter.next();
        expect(first.value).toEqual(neglectionStateA);
        expect(first.done).toBe(false);
        // B is the second element even though it was inserted first
        var second = iter.next();
        expect(second.value).toEqual(neglectionStateB);
        expect(second.done).toBe(false);
        // After iteration over all elements the iterator has no more data
        var behind = iter.next();
        expect(behind.value).toBeUndefined();
        expect(behind.done).toBe(true);
      }
    );

    it('has no effect on an iterator when new data is added to the map', () => {
      var map = new RelayNeglectionStateMap();
      map.register('a');
      // Iterate over all elements
      var iter = map.values();
      iter.next();
      map.register('b');
      var last = iter.next();
      expect(last.done).toBe(true);
    });

    it('has no effect on an iterator when data is removed to the map', () => {
      var map = new RelayNeglectionStateMap();
      map.register('a');
      map.increaseSubscriptionsFor('b');
      // Iterate over all elements
      var iter = map.values();
      map.remove('a');
      var first = iter.next();
      var second = iter.next();
      var last = iter.next();
      expect(first.value).toEqual(neglectionStateA);
      expect(first.done).toBe(false);
      expect(second.value).toEqual(neglectionStateB);
      expect(second.done).toBe(false);
      expect(last.done).toBe(true);
    });
  });
});
