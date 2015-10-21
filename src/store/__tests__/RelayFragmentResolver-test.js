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
  .dontMock('RelayStoreData');

const RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
const Relay = require('Relay');
const RelayFragmentResolver = require('RelayFragmentResolver');
const RelayRecordStore = require('RelayRecordStore');
const RelayStoreData = require('RelayStoreData');

const readRelayQueryData = require('readRelayQueryData');

describe('RelayFragmentResolver', () => {
  let fragment;
  let results;
  let store;
  let storeData;

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
    const fragmentPointer = new GraphQLFragmentPointer(
      dataID,
      fragment
    );
    return new RelayFragmentResolver(storeData, fragmentPointer);
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    const concreteFragment = Relay.QL`fragment on Node{id,address{country}}`
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
    writePayload(store, query, {node: results});

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if reset() is called with active subscriptions', () => {
    const resolver = createFragmentResolver('123');
    resolver.subscribe(genMockSubscriber());
    expect(() => resolver.reset()).toFailInvariant(
      'RelayFragmentResolver: Cannot reset a resolver with active subscriptions'
    );
  });

  describe('read()', () => {
    it('does not read data before the first subscriber is registered', () => {
      createFragmentResolver('123');
      expect(readRelayQueryData).not.toBeCalled();
    });

    it('returns the results of a fragment', () => {
      const resolver = createFragmentResolver('123');
      expect(resolver.read()).toEqual(results);
    });

    it('returns null if the root record is deleted', () => {
      const resolver = createFragmentResolver('123');
      store.deleteRecord('123');
      expect(resolver.read()).toEqual(null);
    });

    it('returns undefined if the root record is unfetched', () => {
      const resolver = createFragmentResolver('123');
      store.removeRecord('123');
      expect(resolver.read()).toEqual(undefined);
    });
  });

  describe('subscribe()', () => {
    it('cannot double-unsubscribe a subscription', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      const subscription = resolver.subscribe(subscriber);
      subscription.dispose();
      expect(() => subscription.dispose()).toFailInvariant(
        'RelayFragmentResolver: Subscriptions may only be disposed once.'
      );
    });

    it('does not immediately call onNext of the first subscriber', () => {
      const resolver = createFragmentResolver('123');
      const subscriber = genMockSubscriber();
      resolver.subscribe(subscriber);

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
      const resolver = createFragmentResolver('123');
      const firstSubscriber = genMockSubscriber();
      resolver.subscribe(firstSubscriber);
      readRelayQueryData.mockClear();
      firstSubscriber.mockClear();

      const secondSubscriber = genMockSubscriber();
      resolver.subscribe(secondSubscriber);
      expect(readRelayQueryData).not.toBeCalled();
      expect(firstSubscriber.onNext).not.toBeCalled();
      expect(secondSubscriber.onNext).not.toBeCalled();
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
      store.putField('client:1', 'country', 'JP');
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
      store.putField('client:1', 'country', 'JP');
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
      store.deleteRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith(null);
      subscriber.mockClear();

      // restoring the record calls onNext
      store.putRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith({
        __dataID__: '123',
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
      store.putRecord('123');
      storeData.getChangeEmitter().broadcastChangeForID('123');
      jest.runAllTimers();
      expect(subscriber.onCompleted).not.toBeCalled();
      expect(subscriber.onError).not.toBeCalled();
      expect(subscriber.onNext).toBeCalledWith({
        __dataID__: '123',
      });
    });
  });

  describe('Garbage Collection', () => {
    let gc;

    beforeEach(() => {
      gc = storeData.getGarbageCollector();
    });

    it('increments reference counts on read()', () => {
      const resolver = createFragmentResolver('123');
      resolver.read();
      expect(gc.increaseSubscriptionsFor).toBeCalledWith('123');
      expect(gc.increaseSubscriptionsFor).toBeCalledWith('client:1');
    });

    it('increments reference counts on subscribe()', () => {
      const resolver = createFragmentResolver('123');
      resolver.subscribe(genMockSubscriber());
      expect(gc.increaseSubscriptionsFor).toBeCalledWith('123');
      expect(gc.increaseSubscriptionsFor).toBeCalledWith('client:1');
    });

    it('decrements reference counts on reset()', () => {
      const resolver = createFragmentResolver('123');
      resolver.read();
      resolver.reset();
      expect(gc.decreaseSubscriptionsFor).toBeCalledWith('123');
      expect(gc.decreaseSubscriptionsFor).toBeCalledWith('client:1');
    });

    it('decrements reference counts on final dispose()', () => {
      const resolver = createFragmentResolver('123');
      const {dispose} = resolver.subscribe(genMockSubscriber());

      // Records are not dereferenced after a setImmediate
      dispose();
      expect(gc.decreaseSubscriptionsFor).not.toBeCalledWith('123');
      expect(gc.decreaseSubscriptionsFor).not.toBeCalledWith('client:1');

      jest.runAllTimers();
      expect(gc.decreaseSubscriptionsFor).toBeCalledWith('123');
      expect(gc.decreaseSubscriptionsFor).toBeCalledWith('client:1');
    });
  });
});
