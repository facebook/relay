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

describe('observeRelayQueryData', () => {
  var Relay;
  var RelayRecordStore;

  var emptyFunction;
  var observeAllRelayQueryData;
  var observeRelayQueryData;

  var mockCallsbacks;

  // helper functions
  var {getNode} = RelayTestUtils;

  function observeAllData(records, queryNode, dataIDs) {
    return observeAllRelayQueryData(
      new RelayRecordStore({records}),
      queryNode,
      dataIDs
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    emptyFunction = jest.genMockFunction();
    Object.assign(emptyFunction, require.requireActual('emptyFunction'));
    jest.setMock('emptyFunction', emptyFunction);

    Relay = require('Relay');
    RelayRecordStore = require('RelayRecordStore');

    observeAllRelayQueryData = require('observeAllRelayQueryData');
    observeRelayQueryData = require('observeRelayQueryData');

    mockCallsbacks = {
      onCompleted: jest.genMockFunction(),
      onError: jest.genMockFunction(),
      onNext: jest.genMockFunction(),
    };

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('does not create observers when no call to `subscribe` occurred', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {};

    observeAllData(records, query, ['1']);
    expect(observeRelayQueryData.mock.calls.length).toBe(0);
  });

  it('creates observers for the dataIDs when `subscribe` is called', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
    };

    var observer = observeAllData(records, query, ['1']);
    observer.subscribe(mockCallsbacks);
    expect(observeRelayQueryData.mock.calls.length).toBe(1);
  });

  it('disposes of observers for dataIDs that are no longer observed', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
      3: {__dataID__: '3', id: 3},
    };

    var observer = observeAllData(records, query, ['1', '2', '3']);
    observer.subscribe(mockCallsbacks);
    expect(observeRelayQueryData.mock.calls.length).toBe(3);
    observer.setDataIDs(['1', '2']);
    expect(
      observeRelayQueryData.mock.observers[2].subscriptions[0].dispose
    ).toBeCalled();
  });

  it('disposes all subscriptions when `dispose` is called', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
      3: {__dataID__: '3', id: 3},
    };

    var observer = observeAllData(records, query, ['1', '2', '3']);
    observer.subscribe(mockCallsbacks).dispose();
    observeRelayQueryData.mock.observers.forEach(
      observer => expect(observer.subscriptions[0].dispose).toBeCalled()
    );
  });

  it('disposes remaining subscriptions when `dispose` is called', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
      3: {__dataID__: '3', id: 3},
    };

    var observer = observeAllData(records, query, ['1', '2', '3']);
    var subscription = observer.subscribe(mockCallsbacks);
    observer.setDataIDs(['1', '2']);
    expect(
      observeRelayQueryData.mock.observers[2].subscriptions[0].dispose
    ).toBeCalled();
    subscription.dispose();
    observeRelayQueryData.mock.observers.forEach(observer =>
      expect(observer.subscriptions[0].dispose.mock.calls.length).toBe(1)
    );
  });

  it('throws an error when a subscription is disposed of twice', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
      3: {__dataID__: '3', id: 3},
    };

    var observer = observeAllData(records, query, ['1', '2', '3']);
    var subscription = observer.subscribe(mockCallsbacks);
    subscription.dispose();
    expect(() => subscription.dispose()).toFailInvariant(
      'RelayObserver.dispose(): Subscription was already disposed.'
    );
  });

  it('adds observers for dataIDs that were not yet observed', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
    };

    var observer = observeAllData(records, query, ['1']);
    observer.subscribe(mockCallsbacks);
    expect(observeRelayQueryData.mock.calls[0][2]).toBe('1');
    expect(observeRelayQueryData.mock.calls.length).toBe(1);
    observer.setDataIDs(['1', '2']);
    expect(observeRelayQueryData.mock.calls.length).toBe(2);
    expect(observeRelayQueryData.mock.calls[1][2]).toBe('2');
  });

  it('calls the callback with the data for all observed dataIDs', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
    };

    var observer = observeAllData(records, query, ['1', '2']);
    observer.subscribe(mockCallsbacks);
    expect(mockCallsbacks.onNext.mock.calls[0][0]).toEqual([
      {__dataID__: '1', id: 1},
      {__dataID__: '2', id: 2},
    ]);
  });

  it('calls the callback only once when observed dataIDs change', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      1: {__dataID__: '1', id: 1},
      2: {__dataID__: '2', id: 2},
      3: {__dataID__: '3', id: 3},
    };

    var observer = observeAllData(records, query, ['1']);
    observer.subscribe(mockCallsbacks);
    expect(mockCallsbacks.onNext.mock.calls.length).toBe(1);
    observer.setDataIDs(['1', '2', '3']);
    expect(mockCallsbacks.onNext.mock.calls.length).toBe(2);
    expect(mockCallsbacks.onNext.mock.calls[1][0]).toEqual([
      {__dataID__: '1', id: 1},
      {__dataID__: '2', id: 2},
      {__dataID__: '3', id: 3},
    ]);
  });

  it('calls the callback with data in the same order the dataIDs are', () =>{
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      a: {__dataID__: 'a', id: 1},
      b: {__dataID__: 'b', id: 2},
      c: {__dataID__: 'c', id: 3},
    };

    var observer = observeAllData(records, query, ['a', 'b', 'c']);
    observer.subscribe(mockCallsbacks);
    expect(mockCallsbacks.onNext.mock.calls[0][0]).toEqual([
      {__dataID__: 'a', id: 1},
      {__dataID__: 'b', id: 2},
      {__dataID__: 'c', id: 3},
    ]);

    observer.setDataIDs(['c', 'a', 'b']);
    expect(mockCallsbacks.onNext.mock.calls[1][0]).toEqual([
      {__dataID__: 'c', id: 3},
      {__dataID__: 'a', id: 1},
      {__dataID__: 'b', id: 2},
    ]);
  });

  it('not longer includes the data for removed dataIDs', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      a: {__dataID__: 'a', id: 1},
      b: {__dataID__: 'b', id: 2},
    };

    var observer = observeAllData(records, query, ['a', 'b']);
    observer.subscribe(mockCallsbacks);

    observer.setDataIDs(['a']);
    expect(mockCallsbacks.onNext.mock.calls[1][0]).toEqual([
      {__dataID__: 'a', id: 1},
    ]);
  });

  it('receives an error when any observed data receives an error', () => {
    var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
    var records = {
      a: {__dataID__: 'a', id: 1},
      b: {__dataID__: 'b', id: 2},
    };

    var error = new Error('An error occured');
    var observer = observeAllData(records, query, ['a', 'b']);
    observer.subscribe(mockCallsbacks);
    expect(mockCallsbacks.onError).not.toBeCalled();
    observeRelayQueryData.mock.observers[0].subscriptions[0].callbacks.onError(
      error
    );
    expect(mockCallsbacks.onError).toBeCalledWith(error);
  });

  it(
    'immediately receives an error when creating a new subscriber when an ' +
    'error already occurred',
    () => {
      var query = getNode(Relay.QL`fragment on Node @relay(plural:true){id}`);
      var records = {
        a: {__dataID__: 'a', id: 1},
      };

      var observer = observeAllData(records, query, ['a', 'b']);
      observer.subscribe(mockCallsbacks);
      var lastError = mockCallsbacks.onError.mock.calls[0][0];
      var subscription = observer.subscribe(mockCallsbacks);
      expect(mockCallsbacks.onError.mock.calls[1][0]).toBe(lastError);

      // Confirm that `dispose` is actually `emptyFunction`
      subscription.dispose();
      expect(emptyFunction).toBeCalled();
    }
  );
});
