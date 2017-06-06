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

jest.dontMock('GraphQLStoreChangeEmitter');

const Relay = require('Relay');
const RelayFragmentResolver = require('RelayFragmentResolver');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('readRelayQueryData');

describe('RelayFragmentResolver', () => {
  let fragment;
  let results;
  let store;
  let storeData;
  let writer;

  // helper functions
  const {getNode, writePayload} = RelayTestUtils;

  function genMockSubscriber() {
    const onCompleted = jest.genMockFunction();
    const onError = jest.genMockFunction();
    const onNext = jest.genMockFunction();
    const mockClear = () => {
      [onCompleted, onError, onNext].forEach(fn => fn.mockClear());
    };
    return {
      onCompleted,
      onError,
      onNext,
      mockClear,
    };
  }

  function createFragmentResolver(dataID) {
    return new RelayFragmentResolver(
      storeData,
      fragment,
      dataID
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    const concreteFragment = Relay.QL`fragment on Node{id,address{country}}`;
    const query = getNode(Relay.QL`
      query {
        node(id: "123") {
          ${concreteFragment},
        }
      }
    `);
    results = {
      __dataID__: '123',
      id: '123',
      address: {
        __dataID__: 'client:1',
        country: 'US',
      },
    };
    fragment = getNode(concreteFragment);
    storeData = new RelayStoreData();
    storeData.initializeGarbageCollector();
    store = storeData.getRecordStore();
    writer = storeData.getRecordWriter();
    writePayload(store, writer, query, {node: results});

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('subscribe()', () => {
    it('subscription `dispose` is idempotent', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      const subscription = resolver.subscribe(subscriber);
      subscription.dispose();
      subscription.dispose();
    });

    it('immediately calls onNext of the first subscriber', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      resolver.subscribe(subscriber);

      expect(readRelayQueryData).toBeCalledWith(
        storeData,
        fragment,
        '123'
      );
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith(results);
    });

    it('immediately calls onNext of subsequent subscribers', () => {
      const resolver = createFragmentResolver('123');
      const firstSubscriber = genMockSubscriber();
      resolver.subscribe(firstSubscriber);
      readRelayQueryData.mockClear();
      firstSubscriber.mockClear();

      const secondSubscriber = genMockSubscriber();
      resolver.subscribe(secondSubscriber);
      expect(readRelayQueryData).not.toBeCalled();
      expect(firstSubscriber.onNext).not.toBeCalled();
      expect(secondSubscriber.onCompleted).not.toBeCalled();
      expect(secondSubscriber.onNext).toBeCalledWith(results);
      expect(secondSubscriber.onError).not.toBeCalled();
    });

    it('updates all subscribers when data changes', () => {
      const resolver = createFragmentResolver('123');
      const subscribers = [
        genMockSubscriber(),
        genMockSubscriber(),
      ];
      subscribers.forEach(subscriber => {
        resolver.subscribe(subscriber);
        subscriber.mockClear();
      });

      // Change the data to ensure that `onNext` is called
      writer.putField('client:1', 'country', 'JP');
      results.address.country = 'JP';
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();

      subscribers.forEach(subscriber => {
        expect(subscriber.onCompleted).not.toBeCalled();
        expect(subscriber.onError).not.toBeCalled();
        expect(subscriber.onNext).toBeCalledWith(results);
      });
    });

    it('does not call callbacks after a subscription is disposed', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      const subscription = resolver.subscribe(subscriber);
      subscriber.mockClear();
      subscription.dispose();

      // Change the data to ensure that `onNext` would be called
      writer.putField('client:1', 'country', 'JP');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();

      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).not.toBeCalled();
    });

    it('calls onNext if the record is deleted', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      resolver.subscribe(subscriber);
      subscriber.mockClear();

      // deleting the record calls onNext
      writer.deleteRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith(null);
      subscriber.mockClear();

      // restoring the record calls onNext
      writer.putRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith({
        __dataID__: '123',
        __status__: 4,
      });
    });

    it('calls onNext if the record is evicted from the store', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      resolver.subscribe(subscriber);
      subscriber.mockClear();

      // evicting the record calls onNext
      store.removeRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith(undefined);
      subscriber.mockClear();

      // restoring the record calls onNext
      writer.putRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith({
        __dataID__: '123',
        __status__: 4,
      });
    });
  });

  describe('Garbage Collection', () => {
    let gc;

    beforeEach(() => {
      const RelayGarbageCollector =
        jest.genMockFromModule('RelayGarbageCollector');
      gc = new RelayGarbageCollector();
      storeData.getGarbageCollector = () => gc;
    });

    it('increments reference counts on subscribe()', () => {
      const resolver = createFragmentResolver('123');
      resolver.subscribe(genMockSubscriber());
      expect(gc.incrementReferenceCount).toBeCalledWith('123');
      expect(gc.incrementReferenceCount).toBeCalledWith('client:1');
    });

    it('decrements reference counts on final dispose()', () => {
      const resolver = createFragmentResolver('123');
      const {dispose} = resolver.subscribe(genMockSubscriber());

      // Records are not dereferenced after a setImmediate
      dispose();
      expect(gc.decrementReferenceCount).not.toBeCalledWith('123');
      expect(gc.decrementReferenceCount).not.toBeCalledWith('client:1');

      jest.runAllTimers();
      expect(gc.incrementReferenceCount).toBeCalledWith('123');
      expect(gc.incrementReferenceCount).toBeCalledWith('client:1');
    });
  });
});
