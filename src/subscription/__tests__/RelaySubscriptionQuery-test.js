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

jest
  .unmock('RelayQuery')
  .unmock('RelaySubscriptionQuery')
  .unmock('QueryBuilder');

const QueryBuilder = require('QueryBuilder');
const RelayQuery = require('RelayQuery');
const RelaySubscriptionQuery = require('RelaySubscriptionQuery');

describe('RelaySubscriptionQuery', () => {
  let mockSubscription;
  let subscriptionNode;

  describe('buildQuery', () => {
    beforeEach(() => {
      jest.resetModuleRegistry();

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
      subscriptionNode = QueryBuilder.getSubscription(mockSubscription.getSubscription());
    });

    it('should build a concrete subscription into a relay-query-subscription', () => {
      const query = RelaySubscriptionQuery.buildQuery({
        configs: mockSubscription.getConfigs(),
        subscription: subscriptionNode,
        input: mockSubscription.getVariables(),
      });

      expect(query).toBeDefined();
      expect(query instanceof RelayQuery.Subscription).toBe(true);
    });
  });
});