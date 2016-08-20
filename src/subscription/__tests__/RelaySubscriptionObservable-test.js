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

const Relay = require('Relay');
const RelayStore = require('RelayStore');

jest
  .unmock('RelaySubscriptionObserver')
  .unmock('RelaySubscriptionObservable')
  .unmock('RelaySubscriptionRequest');

const RelaySubscriptionRequest = require('RelaySubscriptionRequest');

describe('RelaySubscriptionObservable', () => {
  let mockSubscription;
  let mockSubscriptionDisposable;
  let networkLayer;
  let observable;
  let storeData;
  let subscriptionObserver;

  beforeEach(() => {
    jest.resetModuleRegistry();

    storeData = RelayStore.getStoreData();
    subscriptionObserver = storeData.getSubscriptionObserver();
    networkLayer = storeData.getNetworkLayer();
    mockSubscriptionDisposable = {
      dispose: jest.fn(),
    };
    networkLayer.sendSubscription = jest.fn().mockReturnValue(mockSubscriptionDisposable);

    const initialVariables = {feedbackId: 'aFeedbackId'};
    function makeMockSubscription() {
      class MockSubscriptionClass extends Relay.Subscription {
        static initialVariables = initialVariables;
        getConfigs() {
          return [];
        }
        getSubscription() {
          return Relay.QL`
            subscription {
              feedbackLikeSubscribe (input: $input) {
                feedback {
                  likeSentence
                }
              }
            }
          `;
        }
        getVariables() {
          return initialVariables;
        }
      }
      return MockSubscriptionClass;
    }
    const MockSubscription = makeMockSubscription();
    mockSubscription = new MockSubscription();
    observable = subscriptionObserver.observe(mockSubscription);
  });

  describe('getSubscription', () => {
    it('should return attached subscription', () => {
      expect(observable.getSubscription()).toBe(mockSubscription);
    });
  });

  describe('subscribe', () => {
    let callbacks;

    beforeEach(() => {
      callbacks = {
        onNext: jest.fn(),
        onError: jest.fn(),
        onCompleted: jest.fn(),
      };
    });

    it('should subscribe to the observable and return disposable', () => {
      const disposable = observable.subscribe(callbacks);

      expect(disposable).toBeDefined();
      expect(typeof disposable.dispose).toBe('function');
      expect(networkLayer.sendSubscription).toBeCalled();
      expect(networkLayer.sendSubscription.mock.calls[0][0] instanceof RelaySubscriptionRequest).toBe(true);
    });

    describe('callbacks', () => {
      let disposable;
      let subscriptionRequest;

      beforeEach(() => {
        disposable = observable.subscribe(callbacks);
        subscriptionRequest = networkLayer.sendSubscription.mock.calls[0][0];
      });

      it('should attach onNext to recieve next subscription request data', () => {
        const next = {};
        subscriptionRequest.onNext(next);

        expect(callbacks.onNext).toBeCalled();
        expect(callbacks.onNext).toBeCalledWith(next);
      });

      it('should attach onError to recieve subscription request errors', () => {
        const err = new Error('error');
        subscriptionRequest.onError(err);

        expect(callbacks.onError).toBeCalled();
        expect(callbacks.onError).toBeCalledWith(err);
      });

      it('should attach onCompleted when subscription request completes', () => {
        const subscriptionRequest = networkLayer.sendSubscription.mock.calls[0][0];
        subscriptionRequest.onCompleted();

        expect(callbacks.onCompleted).toBeCalled();
      });

      describe('multiple callbacks', () => {
        let callbacks2;
        let disposable2;

        beforeEach(() => {
          callbacks2 = {
            onNext: jest.fn(),
            onError: jest.fn(),
            onCompleted: jest.fn(),
          };
          disposable2 = observable.subscribe(callbacks2);
        });

        it('should attach onNext to recieve next subscription request data', () => {
          const next = {};
          subscriptionRequest.onNext(next);

          expect(callbacks.onNext).toBeCalled();
          expect(callbacks.onNext).toBeCalledWith(next);
          expect(callbacks2.onNext).toBeCalled();
          expect(callbacks2.onNext).toBeCalledWith(next);
        });

        it('should attach onError to recieve subscription request errors', () => {
          const err = new Error('error');
          subscriptionRequest.onError(err);

          expect(callbacks.onError).toBeCalled();
          expect(callbacks.onError).toBeCalledWith(err);
          expect(callbacks2.onError).toBeCalled();
          expect(callbacks2.onError).toBeCalledWith(err);
        });

        it('should attach onCompleted when subscription request completes', () => {
          const subscriptionRequest = networkLayer.sendSubscription.mock.calls[0][0];
          subscriptionRequest.onCompleted();

          expect(callbacks.onCompleted).toBeCalled();
          expect(callbacks2.onCompleted).toBeCalled();
        });

        describe('dispose', () => {
          it('should dettach onNext to recieve next subscription request data', () => {
            disposable.dispose();
            const next = {};
            subscriptionRequest.onNext(next);

            expect(callbacks.onNext).not.toBeCalled();
            expect(callbacks2.onNext).toBeCalled();
            expect(callbacks2.onNext).toBeCalledWith(next);
          });

          it('should dettach onError to recieve subscription request errors', () => {
            disposable.dispose();
            const err = new Error('error');
            subscriptionRequest.onError(err);

            expect(callbacks.onError).not.toBeCalled();
            expect(callbacks2.onError).toBeCalled();
            expect(callbacks2.onError).toBeCalledWith(err);
          });

          it('should dettach onCompleted when subscription request completes', () => {
            disposable.dispose();
            subscriptionRequest.onCompleted();

            expect(callbacks.onCompleted).not.toBeCalled();
            expect(callbacks2.onCompleted).toBeCalled();
          });
        });
      });

      describe('dispose', () => {
        beforeEach(() => {
          // spy on jest.fn
          subscriptionObserver.unobserve = jest.fn(subscriptionObserver.unobserve);
        });

        it('should dettach onNext to recieve next subscription request data', () => {
          disposable.dispose();
          const next = {};
          subscriptionRequest.onNext(next);

          expect(callbacks.onNext).not.toBeCalled();
          expect(subscriptionObserver.unobserve).toBeCalled();
        });

        it('should dettach onError to recieve subscription request errors', () => {
          disposable.dispose();
          const err = new Error('error');
          subscriptionRequest.onError(err);

          expect(callbacks.onError).not.toBeCalled();
          expect(subscriptionObserver.unobserve).toBeCalled();
        });

        it('should dettach onCompleted when subscription request completes', () => {
          disposable.dispose();
          subscriptionRequest.onCompleted();

          expect(callbacks.onCompleted).not.toBeCalled();
          expect(subscriptionObserver.unobserve).toBeCalled();
        });
      });
    });
  });

  describe('unobserve', () => {
    beforeEach(() => {
      observable.subscribe({
        onNext: jest.fn(),
        onError: jest.fn(),
        onCompleted: jest.fn(),
      });
    });

    it('should dispose subscription disposable', () => {
      observable.unobserve();

      expect(mockSubscriptionDisposable.dispose).toBeCalled();
    });
  });
});
