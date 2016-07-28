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
const SubscriptionObservable = require('RelaySubscriptionObservable');

jest
  .unmock('RelaySubscriptionObserver')
  .unmock('RelaySubscriptionObservable');

describe('RelaySubscriptionObserver', function() {
  let mockSubscription;
  let observable;
  let storeData;
  let subscriptionObserver;

  beforeEach(() => {
    jest.resetModuleRegistry();

    storeData = RelayStore.getStoreData();
    subscriptionObserver = storeData.getSubscriptionObserver();

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
  });

  describe('observe', function() {
    it('should create an observable', function() {
      const observable = subscriptionObserver.observe(mockSubscription);

      expect(observable instanceof SubscriptionObservable).toBe(true);
    });

    it('should return the same observable for same subscription', function() {
      const observable = subscriptionObserver.observe(mockSubscription);
      const observable2 = subscriptionObserver.observe(mockSubscription);

      expect(observable instanceof SubscriptionObservable).toBe(true);
      expect(observable).toBe(observable2);
    });
  });

  describe('unobserve', function() {
    beforeEach(function() {
      observable = subscriptionObserver.observe(mockSubscription);
      observable.unobserve = jest.fn();
    });

    it('should unobserve observable for subscription', function() {
      subscriptionObserver.unobserve(mockSubscription);

      expect(observable.unobserve).toBeCalled();
    });
  });
});
