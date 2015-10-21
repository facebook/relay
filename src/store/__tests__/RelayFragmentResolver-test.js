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
var RelayFragmentResolver = require('RelayFragmentResolver');
var RelayRecordStore = require('RelayRecordStore');
var RelayStoreData = require('RelayStoreData');

var readRelayQueryData = require('readRelayQueryData');

describe('RelayFragmentResolver', () => {
  var fragment;
  var results;
  var store;
  var storeData;

  // helper functions
  var {getNode, writePayload} = RelayTestUtils;

  function genMockSubscriber() {
    var onCompleted = jest.genMockFunction();
    var onError = jest.genMockFunction();
    var onNext = jest.genMockFunction();
    var mockClear = () => {
      [onCompleted, onError, onNext].forEach(fn => fn.mockClear());
    };
    return {
      onCompleted,
      onError,
      onNext,
      mockClear,
    };
  }

  function observeRelayQueryData(dataID) {
    var fragmentPointer = new GraphQLFragmentPointer(
      dataID,
      fragment
    );
    return new RelayFragmentResolver(storeData, fragmentPointer);
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    var concreteFragment = Relay.QL`fragment on Node{id,name}`
    var query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ${concreteFragment},
        }
      }
    `);
    results = {
      __dataID__: '123',
      id: '123',
      name: 'Joe',
    };
    fragment = getNode(concreteFragment);
    storeData = new RelayStoreData();
    store = storeData.getRecordStore();
    writePayload(store, query, {node: results});

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('does not read data before the first subscriber is registered', () => {
    observeRelayQueryData('123');
    expect(readRelayQueryData).not.toBeCalled();
  });

  it('cannot double-unsubscribe a subscription', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    var subscription = observer.subscribe(subscriber);
    subscription.dispose();
    expect(() => subscription.dispose()).toFailInvariant(
      'RelayFragmentResolver: Subscriptions may only be disposed once.'
    );
  });

  it('does not immediately call onNext of the first subscriber', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);

    expect(readRelayQueryData).toBeCalledWith(
      storeData.getQueuedStore(),
      fragment,
      '123'
    );
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).not.toBeCalled();
  });

  it('does not immediately call onNext of subsequent subscribers', () => {
    var observer = observeRelayQueryData('123');
    var firstSubscriber = genMockSubscriber();
    observer.subscribe(firstSubscriber);
    readRelayQueryData.mockClear();
    firstSubscriber.mockClear();

    var secondSubscriber = genMockSubscriber();
    observer.subscribe(secondSubscriber);
    expect(readRelayQueryData).not.toBeCalled();
    expect(firstSubscriber.onNext).not.toBeCalled();
    expect(secondSubscriber.onNext).not.toBeCalled();
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

    subscribers.forEach(subscriber => {
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith(results);
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

    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).not.toBeCalled();
  });

  it('calls onNext if the record is deleted', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);
    subscriber.mockClear();

    // deleting the record calls onNext
    store.deleteRecord('123');
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith(null);
    subscriber.mockClear();

    // restoring the record calls onNext
    store.putRecord('123');
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith({
      __dataID__: '123',
    });
  });

  it('calls onNext if the record is evicted from the store', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);
    subscriber.mockClear();

    // evicting the record calls onNext
    store.removeRecord('123');
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith(undefined);
    subscriber.mockClear();

    // restoring the record calls onNext
    store.putRecord('123');
    GraphQLStoreChangeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith({
      __dataID__: '123',
    });
  });
});
