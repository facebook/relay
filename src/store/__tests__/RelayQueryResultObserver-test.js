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

jest
  .dontMock('GraphQLStoreChangeEmitter')
  .dontMock('GraphQLStoreQueryResolver');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
var Relay = require('Relay');
var RelayQueryResultObserver = require('RelayQueryResultObserver');
var RelayRecordStore = require('RelayRecordStore');
var RelayStoreData = require('RelayStoreData');
var RelayStoreGarbageCollector = require('RelayStoreGarbageCollector');

var readRelayQueryData = require('readRelayQueryData');

describe('RelayQueryResultObserver', () => {
  var query;
  var records;
  var results;
  var store;

  // helper functions
  var {getNode} = RelayTestUtils;

  function genMockSubscriber() {
    var onComplete = jest.genMockFunction();
    var onError = jest.genMockFunction();
    var onNext = jest.genMockFunction();
    var mockClear = () => {
      [onComplete, onError, onNext].forEach(fn => fn.mockClear());
    };
    return {
      onComplete,
      onError,
      onNext,
      mockClear,
    };
  }

  function observeRelayQueryData(dataID) {
    var fragmentPointer = new GraphQLFragmentPointer(
      dataID,
      query
    );
    return new RelayQueryResultObserver(store, fragmentPointer);
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    query = getNode(Relay.QL`fragment on Node{id,name}`);
    records = {
      '123': {
        __dataID__: '123',
        id: '123',
        name: 'Joe',
        firstName: 'Joe',
      },
    };
    results = {
      __dataID__: '123',
      id: '123',
      name: 'Joe',
    };
    store = new RelayRecordStore({records});

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('does not read data before the first subscriber is registered', () => {
    var observer = observeRelayQueryData('123');
    expect(readRelayQueryData).not.toBeCalled();
  });

  it('cannot double-unsubscribe a subscriber', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);
    subscription.dispose();
    expect(() => subscription.dispose()).toFailInvariant(
      'RelayQueryResultObserver: Subscriptions may only be disposed once.'
    );
  });

  it('immediately calls onNext of the first subscriber', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);

    expect(readRelayQueryData).toBeCalledWith(
      store,
      query,
      '123'
    );
    expect(subscriber.onNext).toBeCalledWith(results);
    expect(subscriber.onError).not.toBeCalled();
  });

  it('immediately calls onNext of subsequent subscribers', () => {
    var observer = observeRelayQueryData('123');
    var firstSubscriber = genMockSubscriber();
    observer.subscribe(firstSubscriber);
    readRelayQueryData.mockClear();
    firstSubscriber.mockClear();

    var secondSubscriber = genMockSubscriber();
    observer.subscribe(secondSubscriber);
    expect(readRelayQueryData).not.toBeCalled();
    expect(firstSubscriber.onNext).not.toBeCalled();
    expect(secondSubscriber.onNext).toBeCalledWith(results);
    expect(secondSubscriber.onError).not.toBeCalled();
  });

  it('updates all subscribers when data changes', () => {
    var observer = observeRelayQueryData('123');
    var subscribers = [
      genMockSubscriber(),
      genMockSubscriber(),
    ];
    subscribers.forEach(subscriber => {
      observer.subscribe(subscriber);
      subscriber.mockClear();
    });

    store.putField('123', 'name', 'Joseph');
    results.name = 'Joseph';
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();

    subscribers.forEach(({onNext}) => {
      expect(onNext).toBeCalledWith(results);
    });
  });

  it('does not call callbacks after a subscription is disposed', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);
    subscriber.mockClear();
    subscription.dispose();

    store.putField('123', 'name', 'Joseph');
    results.name = 'Joseph';
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();

    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).not.toBeCalled();
  });

  it('immediately calls onError if the record is unfetched', () => {
    var observer = observeRelayQueryData('oops');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);

    expect(subscriber.onNext).not.toBeCalled();
    var error = subscriber.onError.mock.calls[0][0];
    expect(error.message).toBe(
      'Cannot observe unfetched record(s) `oops`.'
    );
    expect(error.name).toBe('RelayQueryResultObserver');
  });

  it('calls onError if the record is removed from the store', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);
    subscriber.mockClear();

    store.removeRecord('123');
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();

    expect(subscriber.onNext).not.toBeCalled();
    var error = subscriber.onError.mock.calls[0][0];
    expect(error.message).toBe(
      'Observed record(s) `123` was purged from the cache.'
    );
    expect(error.name).toBe('RelayQueryResultObserver');
  });
});
