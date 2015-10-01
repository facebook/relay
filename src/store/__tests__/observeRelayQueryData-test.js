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

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
var Relay = require('Relay');
var observeRelayQueryData = require('observeRelayQueryData');
var RelayStoreData = require('RelayStoreData');
var RelayStoreGarbageCollector = require('RelayStoreGarbageCollector');

describe('observeRelayQueryData', () => {
  var RelayRecordStore;

  var addListenerForIDs;

  var firstMockCallback;
  var secondMockCallback;

  // helper functions
  var {getNode} = RelayTestUtils;

  function observeData(records, queryNode, dataID) {
    return observeRelayQueryData(
      new RelayRecordStore({records}),
      queryNode,
      dataID
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    addListenerForIDs = GraphQLStoreChangeEmitter.addListenerForIDs;

    firstMockCallback = jest.genMockFunction();
    secondMockCallback = jest.genMockFunction();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('calls `onError` on the first subscriber if no data was found', () => {
    var query = getNode(Relay.QL`fragment on Node{id, name}`);
    var name = 'RelayObserverError';
    var message = 'Record `node` has not been fetched.';
    observeData({}, query, 'node').subscribe({
      onError: firstMockCallback,
    });

    expect(firstMockCallback).toBeCalled();
    expect(firstMockCallback.mock.calls[0][0].name).toBe(name);
    expect(firstMockCallback.mock.calls[0][0].message).toBe(message);
  });

  it('throws an error when a subscription is disposed of twice', () => {
    var query = getNode(Relay.QL`fragment on Node{id, name}`);
    var records = {node: null};
    var subscription = observeData(records, query, 'node').subscribe({
      onNext: firstMockCallback,
    });

    subscription.dispose();
    expect(() => subscription.dispose()).toFailInvariant(
      'RelayObserver.dispose(): Subscription was already disposed.'
    );
  });

  it('adds a subscription to the data with the given DataID', () => {
    var query = getNode(Relay.QL`fragment on Node{id, name}`);
    var records = {node: null};
    observeData(records, query, 'node').subscribe({
      onNext: firstMockCallback
    });

    expect(firstMockCallback).toBeCalledWith(null);
  });

  it('calls only the newly registered subscriber immediately', () => {
    var query = getNode(Relay.QL`fragment on Node{id, name}`);
    var records = {node: null};
    var observable = observeData(records, query, 'node');

    observable.subscribe({onNext: firstMockCallback});
    expect(firstMockCallback).toBeCalled();

    observable.subscribe({onNext: secondMockCallback});

    expect(secondMockCallback).toBeCalled();
    expect(firstMockCallback.mock.calls.length).toBe(1);
  });

  it('no longer watches data when no subscribers are attached', () => {
    var recordsStore = new RelayRecordStore({records: {
      user: {id: 1, name: 'Chris', birthdate: {__dataID__: 'date'}},
      date: null,
    }});
    var query = getNode(Relay.QL`fragment on User{id, name, birthdate {day}}`);
    observeRelayQueryData(recordsStore, query, 'user').subscribe({
      onNext: firstMockCallback,
    }).dispose();

    expect(addListenerForIDs.mock.calls.length).toBe(1);
    expect(addListenerForIDs.mock.remove[0]).toBeCalled();
  });

  it('calls a subscriber when observed data changes', () => {
    var recordsStore = new RelayRecordStore({records: {
      user: {id: 1, name: 'Chris', birthdate: {__dataID__: 'date'}},
      date: null,
    }});
    var query = getNode(Relay.QL`fragment on User{id, name, birthdate {day}}`);
    var observable = observeRelayQueryData(recordsStore, query, 'user');

    observable.subscribe({onNext: firstMockCallback});
    var handleUpdate = addListenerForIDs.mock.calls[0][1];

    // Mutate data in record store directly
    recordsStore.putField('user', 'name', 'Joe');
    handleUpdate();

    expect(firstMockCallback.mock.calls.length).toBe(2);
    expect(addListenerForIDs.mock.remove[0]).toBeCalled();
    expect(firstMockCallback).toBeCalledWith({
      __dataID__: 'user',
      id: 1,
      name: 'Joe',
      birthdate: null,
    });

    // Check that the change emitter still listens to the right id
    expect(addListenerForIDs.mock.calls[1][0]).toEqual([
      'user', 'date'
    ]);
  });

  it('calls subscribers when data is added to an observed node', () => {
    var recordsStore = new RelayRecordStore({records: {
      user: {id: 1, name: 'Chris', birthdate: {__dataID__: 'date'}},
      date: null,
    }});
    var query = getNode(Relay.QL`fragment on User{id, name, birthdate {day}}`);
    var observable = observeRelayQueryData(recordsStore, query, 'user');

    observable.subscribe({onNext: firstMockCallback});
    var handleUpdate = addListenerForIDs.mock.calls[0][1];

    // Mutate birthdate record
    recordsStore.putRecord('date', 'Type');
    recordsStore.putField('date', 'day', 30);
    handleUpdate();

    expect(firstMockCallback).toBeCalledWith({
      __dataID__: 'user',
      id: 1,
      name: 'Chris',
      birthdate: {
        __dataID__: 'date',
        day: 30,
      },
    });
    expect(addListenerForIDs.mock.remove[0]).toBeCalled();
    expect(addListenerForIDs.mock.calls[1][0]).toEqual([
      'user', 'date'
    ]);
  });

  it('calls a subscriber when data disappears from a node', () => {
    var recordsStore = new RelayRecordStore({records: {
      user: {id: 1, name: 'Jon', birthdate: {__dataID__: 'date'}},
      date: {day: 15 },
    }});
    var query = getNode(Relay.QL`fragment on User{id, name, birthdate {day}}`);
    var observable = observeRelayQueryData(recordsStore, query, 'user');

    observable.subscribe({onNext: firstMockCallback});
    var handleUpdate = addListenerForIDs.mock.calls[0][1];

    // Remove record from store
    recordsStore.deleteRecord('date');
    handleUpdate();

    expect(firstMockCallback).toBeCalledWith({
      __dataID__: 'user',
      id: 1,
      name: 'Jon',
      birthdate: null,
    });
    expect(addListenerForIDs.mock.calls[0][0]).toEqual([
      'user', 'date'
    ]);
    expect(addListenerForIDs.mock.remove[0]).toBeCalled();
    expect(addListenerForIDs.mock.calls[1][0]).toEqual([
      'user', 'date'
    ]);
  });

  it('no longer calls disposed-of subscribers when data changes', () => {
    var recordsStore = new RelayRecordStore({records: {
      user: {id: 1, name: 'Jon', birthdate: {__dataID__: 'date'}},
      date: {day: 15 },
    }});
    var query = getNode(Relay.QL`fragment on User{id, name, birthdate {day}}`);
    var observable = observeRelayQueryData(recordsStore, query, 'user');

    observable.subscribe({onNext: firstMockCallback});
    var handleUpdate = addListenerForIDs.mock.calls[0][1];
    var subscription = observable.subscribe({onNext: secondMockCallback});

    expect(secondMockCallback).toBeCalled();

    subscription.dispose();
    recordsStore.deleteRecord('date');
    handleUpdate();

    expect(firstMockCallback.mock.calls.length).toBe(2);
    expect(secondMockCallback.mock.calls.length).toBe(1);
  });

  describe('garbage collection', () => {
    var garbageCollector;
    var observable;
    var recordsStore;

    /**
     * Gets the first parameter passed into increaseSubscriptionsFor.
     */
    function getIncreaseSubscriptionsParameters(count) {
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls.length
      ).toBe(count);
      return garbageCollector.increaseSubscriptionsFor.mock.calls.map(
        call => call[0]
      ).sort();
    }

    /**
     * Gets the first parameter passed into decreaseSubscriptionsFor.
     */
    function getDecreaseSubscriptionsParameters(count) {
      expect(
        garbageCollector.decreaseSubscriptionsFor.mock.calls.length
      ).toBe(count);
      return garbageCollector.decreaseSubscriptionsFor.mock.calls.map(
        call => call[0]
      ).sort();
    }

    beforeEach(() => {
      // Prepare mock garbage collector and mock observable
      garbageCollector = new RelayStoreGarbageCollector();

      RelayStoreData.prototype.getGarbageCollector =
        jest.genMockFunction().mockReturnValue(garbageCollector);

      var query = getNode(Relay.QL`
        fragment on User {
          birthdate {
            day,
          },
          address {
            city
          },
        }
      `);
      recordsStore = new RelayRecordStore({records: {
        chris: {__dataID__: 'chris', address: {__dataID__: 'address'}},
        date: {__dataID__: 'date', day: 15},
        address: {__dataID__: 'address', city: 'Menlo Park'},
      }});
      observable = observeRelayQueryData(recordsStore, query, 'chris');
    });

    it(
      'increases the subscriptions when the first subscriber is added',
      () => {
        expect(garbageCollector.increaseSubscriptionsFor).not.toBeCalled();
        observable.subscribe({onNext: firstMockCallback});
        var increasedSubscriptions = getIncreaseSubscriptionsParameters(2);
        expect(increasedSubscriptions).toEqual(['address', 'chris']);
      }
    );

    it(
      'decreases the subscriptions when the last subscriber is disposed',
      () => {
        var subscription = observable.subscribe({onNext: firstMockCallback});
        expect(garbageCollector.decreaseSubscriptionsFor).not.toBeCalled();
        subscription.dispose();
        var decreasedSubscriptions = getDecreaseSubscriptionsParameters(2);
        expect(decreasedSubscriptions).toEqual(['address', 'chris']);
      }
    );

    it('does not change the subscription count if no dataIDs change', () => {
      observable.subscribe({onNext: firstMockCallback});
      var handleUpdate = addListenerForIDs.mock.calls[0][1];
      // Called increaseSubscriptions 2 times
      // Called decreaseSubscriptions 0 times
      handleUpdate();

      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls.length
      ).toBe(2);
      expect(
        garbageCollector.decreaseSubscriptionsFor.mock.calls.length
      ).toBe(0);
    });

    it('only changes the subscription count for changed dataIDs', () => {
      observable.subscribe({onNext: firstMockCallback});
      var handleUpdate = addListenerForIDs.mock.calls[0][1];
      // Called increaseSubscriptions 2 times
      // Called decreaseSubscriptions 0 times

      // Remove record with id `address` from
      recordsStore.deleteField('chris', 'address');
      recordsStore.putLinkedRecordID('chris', 'birthdate', 'date');
      handleUpdate();
      expect(
        garbageCollector.decreaseSubscriptionsFor.mock.calls.length
      ).toBe(1);
      expect(
        garbageCollector.decreaseSubscriptionsFor.mock.calls[0][0]
      ).toBe('address');
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls.length
      ).toBe(3);
      expect(
        garbageCollector.increaseSubscriptionsFor.mock.calls[2][0]
      ).toBe('date');
    });
  });
});
