/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

jest.autoMockOff();

const commitRelayStaticMutation = require('commitRelayStaticMutation');
const RelayStaticTestUtils = require('RelayStaticTestUtils');
const {createMockEnvironment} = require('RelayStaticMockEnvironment');
const {ROOT_ID} = require('RelayStoreUtils');

describe('commitRelayStaticMutation', () => {
  let callback, environment, snapshot, store;
  const {generateAndCompile} = RelayStaticTestUtils;

  const mutation = generateAndCompile(`
    mutation FeedbackLikeMutation(
      $input: FeedbackLikeInput!
    ) {
      feedbackLike(input: $input) {
        feedback {
          id
          likers {
            count
          }
          doesViewerLike
        }
      }
    }
  `).FeedbackLikeMutation;
  const variables = {
    input: {
      clientMutationId: '0',
      feedbackId: '456',
    },
  };
  const {FeedbackLikeQuery} = generateAndCompile(`
    query FeedbackLikeQuery {
      node(id: "123") {
        feedback {
          doesViewerLike
          id
          likers {
            count
          }
        }
      }
    }
  `);

  const optimisticPayload = {
    feedbackLike: {
      feedback: {
        doesViewerLike: true,
        id: '456',
        __typename: 'Feedback',
        likers: {
          count: 4,
        },
      },
    },
  };
  const optimisticResponse = () => {
    return optimisticPayload;
  };

  beforeEach(() => {
    jest.resetModules();
    callback = jest.fn();

    environment = createMockEnvironment();
    store = environment.getStore();

    const selector = {
      dataID: ROOT_ID,
      node: FeedbackLikeQuery.query,
      variables: {},
    };
    environment.commitPayload(selector,
      {
        node: {
          id: '123',
          __typename: 'Story',
          feedback: {
            doesViewerLike: false,
            id: '456',
            __typename: 'Feedback',
            likers: {
              count: 3,
            },
          },
        },
      },
    );

    snapshot = store.lookup(selector);
    store.subscribe(snapshot, callback);
  });

  it('defaults to using the optimisticResponse in optimisticUpdater is not provided', () => {
    commitRelayStaticMutation(
      environment,
      {
        mutation,
        optimisticResponse,
        variables,
      }
    );
    expect(callback.mock.calls.length).toBe(1);
    const data = callback.mock.calls[0][0].data;
    expect(data.node.feedback.likers.count).toBe(optimisticPayload.feedbackLike.feedback.likers.count);
    expect(data.node.feedback.doesViewerLike).toBe(optimisticPayload.feedbackLike.feedback.doesViewerLike);
  });

  it('uses the optimisticUpdater if provided', () => {
    const payload = {
      feedbackLike: {
        feedback: {
          doesViewerLike: true,
          id: '456',
          __typename: 'Feedback',
          likers: {
            count: 9,
          },
        },
      },
    };
    const {createOperationSelector} = environment.unstable_internal;
    const proxySelector = createOperationSelector(mutation, variables).fragment;
    const optimisticUpdater = (proxy) => {
      proxy.commitPayload(proxySelector, payload);
    };
    commitRelayStaticMutation(
      environment,
      {
        mutation,
        optimisticResponse,
        optimisticUpdater,
        variables,
      }
    );
    expect(callback.mock.calls.length).toBe(1);
    const data = callback.mock.calls[0][0].data;
    expect(data.node.feedback.likers.count).toBe(payload.feedbackLike.feedback.likers.count);
    expect(data.node.feedback.doesViewerLike).toBe(payload.feedbackLike.feedback.doesViewerLike);
  });
});
