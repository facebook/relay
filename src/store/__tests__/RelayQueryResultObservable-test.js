/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

jest
  .dontMock('RelayStoreData')
  .dontMock('GraphQLStoreChangeEmitter')
  .dontMock('GraphQLStoreQueryResolver');

const RelayFragmentPointer = require('RelayFragmentPointer');
const Relay = require('Relay');
const RelayQueryResultObservable = require('RelayQueryResultObservable');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('readRelayQueryData');

describe('RelayQueryResultObservable', () => {
  var storeData;
  var changeEmitter;

  var query;
  var records;
  var results;
  var store;
  var writer;

  // helper functions
  var {getNode} = RelayTestUtils;

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
    return new RelayQueryResultObservable(storeData, query, dataID);
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
    writer = new RelayRecordWriter(records, {}, false);
    storeData = new RelayStoreData();

    storeData.getQueuedStore = jest.genMockFunction().mockImplementation(() => {
      return store;
    });

    changeEmitter = storeData.getChangeEmitter();
    jasmine.addMatchers(RelayTestUtils.matchers);
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
      'RelayQueryResultObservable: Subscriptions may only be disposed once.'
    );
  });

  it('immediately calls onNext of the first subscriber', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);

    expect(readRelayQueryData).toBeCalledWith(
      storeData,
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

    writer.putField('123', 'name', 'Joseph');
    results.name = 'Joseph';
    changeEmitter.broadcastChangeForID('123');
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

    writer.putField('123', 'name', 'Joseph');
    results.name = 'Joseph';
    changeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();

    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).not.toBeCalled();
  });

  it('calls onNext if the record is initially unfetched', () => {
    var observer = observeRelayQueryData('oops');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);

    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith(undefined);
    subscriber.mockClear();

    // fetching the record calls onNext
    writer.putRecord('oops');
    changeEmitter.broadcastChangeForID('oops');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith({
      __dataID__: 'oops',
    });
  });

  it('calls onNext if the record is deleted', () => {
    var observer = observeRelayQueryData('123');
    var subscriber = genMockSubscriber();
    observer.subscribe(subscriber);
    subscriber.mockClear();

    // deleting the record calls onNext
    writer.deleteRecord('123');
    changeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith(null);
    subscriber.mockClear();

    // restoring the record calls onNext
    writer.putRecord('123');
    changeEmitter.broadcastChangeForID('123');
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
    changeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith(undefined);
    subscriber.mockClear();

    // restoring the record calls onNext
    writer.putRecord('123');
    changeEmitter.broadcastChangeForID('123');
    jest.runAllTimers();
    expect(subscriber.onCompleted).not.toBeCalled();
    expect(subscriber.onError).not.toBeCalled();
    expect(subscriber.onNext).toBeCalledWith({
      __dataID__: '123',
    });
  });
});
