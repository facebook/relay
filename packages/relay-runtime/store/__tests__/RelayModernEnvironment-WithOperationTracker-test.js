/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayOperationTracker = require('../RelayOperationTracker');

const invariant = require('invariant');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {
  createMockEnvironment,
  MockPayloadGenerator,
} = require('relay-test-utils');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('RelayModernEnvironment with RelayOperationTracker', () => {
  let tracker;
  let environment;
  let QueryOperation1;
  let QueryOperation2;
  let MutationOperation;
  let operationLoader;

  beforeEach(() => {
    const {Query1, Query2, Mutation1} = generateAndCompile(`
      query Query1($id: ID) @relay_test_operation {
        node(id: $id) {
          ... on Feedback {
            id
            body {
              text
            }
            comments {
              edges {
                node {
                  id
                  message {
                    text
                  }
                }
              }
            }
          }
        }
      }

      query Query2($id: ID) @relay_test_operation {
        node(id: $id) {
          id
        }
      }

      mutation Mutation1($input: CommentCreateInput) @relay_test_operation {
        commentCreate(input: $input) {
          comment {
            id
            message {
              text
            }
          }
          feedback {
            id
            body {
              text
            }
          }
        }
      }
    `);

    QueryOperation1 = createOperationDescriptor(Query1, {id: '1'});
    QueryOperation2 = createOperationDescriptor(Query2, {id: '2'});
    MutationOperation = createOperationDescriptor(Mutation1, {id: '1'});
    operationLoader = {
      load: jest.fn(),
      get: jest.fn(),
    };
    tracker = new RelayOperationTracker();
    environment = createMockEnvironment({
      operationTracker: tracker,
      operationLoader,
    });
  });

  it('should return an instance of tracker', () => {
    expect(environment.getOperationTracker()).toBe(tracker);
  });

  it('should have operation tracker and operations should not be affected', () => {
    invariant(tracker != null, 'Tracker should be defined');
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation2.request,
      ),
    ).toBe(null);
  });

  it('sh©ould return a promise when there are pending operations that are affecting the owner', () => {
    invariant(tracker != null, 'Tracker should be defined');
    environment
      .execute({
        operation: QueryOperation1,
      })
      .subscribe({});

    // Note: Why do we need to `subscribe` here (and in other places)?
    // We need to subscribe a fragment (with the owner) in order to simulate
    // scenario when the fragment is updated - we need to update
    // OperationTracker, and mark this owner as pending, or completed - if an
    // operation that initiated the change is completed.
    environment.subscribe(
      environment.lookup(QueryOperation1.fragment),
      jest.fn(),
    );

    const FEEDBACK_ID = 'my-feedback-id';

    environment.mock.resolve(
      QueryOperation1,
      MockPayloadGenerator.generate(QueryOperation1, {
        Feedback() {
          return {
            id: FEEDBACK_ID,
          };
        },
      }),
    );

    environment
      .executeMutation({
        operation: MutationOperation,
      })
      .subscribe({});

    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);

    // This mutation is changing the same feedback object, so the owner (QueryOperation1)
    // will be affected by this operation
    environment.mock.nextValue(
      MutationOperation,
      MockPayloadGenerator.generate(MutationOperation, {
        Feedback(context) {
          return {
            id: FEEDBACK_ID,
            body: {
              text: 'Updated text',
            },
          };
        },
      }),
    );

    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBeInstanceOf(Promise);

    // Complete the mutation
    environment.mock.complete(MutationOperation.request.node);

    // There should be no pending operations affecting the owner,
    // after the mutation is completed
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);
  });

  it('should not have pending operation affecting the owner, if owner does not have subscriptions', () => {
    invariant(tracker != null, 'Tracker should be defined');
    environment
      .execute({
        operation: QueryOperation1,
      })
      .subscribe({});

    const FEEDBACK_ID = 'my-feedback-id';

    environment.mock.resolve(
      QueryOperation1,
      MockPayloadGenerator.generate(QueryOperation1, {
        Feedback() {
          return {
            id: FEEDBACK_ID,
          };
        },
      }),
    );

    environment
      .executeMutation({
        operation: MutationOperation,
      })
      .subscribe({});

    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);

    // This mutation will update the same data as the QueryOperation1
    // but since there are not subscriptions that have owner QueryOperation1
    // it should not be affected
    environment.mock.nextValue(
      MutationOperation,
      MockPayloadGenerator.generate(MutationOperation, {
        Feedback(context) {
          return {
            id: FEEDBACK_ID,
            body: {
              text: 'Updated text',
            },
          };
        },
      }),
    );
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);
  });

  it('should return a promise for operation affecting owner that resolves when operation completes', () => {
    invariant(tracker != null, 'Tracker should be defined');
    environment
      .execute({
        operation: QueryOperation1,
      })
      .subscribe({});

    environment.subscribe(
      environment.lookup(QueryOperation1.fragment),
      jest.fn(),
    );

    const FEEDBACK_ID = 'my-feedback-id';

    environment.mock.resolve(
      QueryOperation1,
      MockPayloadGenerator.generate(QueryOperation1, {
        Feedback() {
          return {
            id: FEEDBACK_ID,
          };
        },
      }),
    );

    // Let's start mutation
    environment
      .executeMutation({
        operation: MutationOperation,
      })
      .subscribe({});
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);
    environment.mock.nextValue(
      MutationOperation,
      MockPayloadGenerator.generate(MutationOperation, {
        Feedback() {
          return {
            id: FEEDBACK_ID,
            body: {
              text: 'Updated text',
            },
          };
        },
      }),
    );
    const promise = tracker.getPromiseForPendingOperationsAffectingOwner(
      QueryOperation1.request,
    );

    invariant(promise != null, 'Expected to have promise for operation');
    const promiseCallback = jest.fn();
    promise.then(promiseCallback);
    expect(promiseCallback).not.toBeCalled();
    environment.mock.complete(MutationOperation.request.node);
    jest.runAllTimers();
    expect(promiseCallback).toBeCalled();
  });

  it('pending queries that did not change the data should not affect the owner', () => {
    invariant(tracker != null, 'Tracker should be defined');
    // Send the first query
    environment
      .execute({
        operation: QueryOperation1,
      })
      .subscribe({});

    environment.subscribe(
      environment.lookup(QueryOperation1.fragment),
      jest.fn(),
    );

    // Send the second query
    environment
      .execute({
        operation: QueryOperation2,
      })
      .subscribe({});

    environment.subscribe(
      environment.lookup(QueryOperation2.fragment),
      jest.fn(),
    );

    environment.mock.resolve(
      QueryOperation1,
      MockPayloadGenerator.generate(QueryOperation1, {
        Feedback() {
          return {
            id: 'feedback-id-1',
          };
        },
      }),
    );

    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);

    environment.mock.nextValue(
      QueryOperation2,
      MockPayloadGenerator.generate(QueryOperation2, {
        Node() {
          return {
            __typename: 'Feedback',
            id: 'feedback-id-2',
          };
        },
      }),
    );
    expect(
      tracker.getPromiseForPendingOperationsAffectingOwner(
        QueryOperation1.request,
      ),
    ).toBe(null);
  });

  describe('with @match', () => {
    it('should return a promise for affecting operations', () => {
      const {Query, Mutation, FeedbackFragment} = generateAndCompile(`

        fragment PlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
          }
        }

        fragment MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          markdown
          data {
            markup
          }
        }

        fragment FeedbackFragment on Feedback {
          id
          body {
            text
          }
          author {
            __typename
            nameRenderer @match {
              ...PlainUserNameRenderer_name @module(name: "PlainUserNameRenderer.react")
              ...MarkdownUserNameRenderer_name
                @module(name: "MarkdownUserNameRenderer.react")
            }
            plainNameRenderer: nameRenderer @match {
              ...PlainUserNameRenderer_name @module(name: "PlainUserNameRenderer.react")
            }
          }
        }

        fragment UserFragment_userName on User {
          name
        }

        query Query($id: ID) @relay_test_operation {
          node(id: $id) {
            ...FeedbackFragment
          }
        }

        mutation Mutation($input: CommentCreateInput) @relay_test_operation {
          commentCreate(input: $input) {
            feedback {
              ...FeedbackFragment
            }
          }
        }
      `);

      QueryOperation1 = createOperationDescriptor(Query, {id: '1'});
      MutationOperation = createOperationDescriptor(Mutation, {id: '1'});

      invariant(tracker != null, 'Tracker should be defined');
      environment
        .execute({
          operation: QueryOperation1,
        })
        .subscribe({});

      const FEEDBACK_ID = 'my-feedback-id';

      environment.subscribe(
        environment.lookup(QueryOperation1.fragment),
        jest.fn(),
      );
      environment.subscribe(
        environment.lookup(
          createReaderSelector(
            FeedbackFragment,
            FEEDBACK_ID,
            QueryOperation1.request.variables,
            QueryOperation1.request,
          ),
        ),
        jest.fn(),
      );

      operationLoader.load.mockImplementation(() => Promise.resolve());
      environment.mock.resolve(QueryOperation1.request.node, {
        data: {
          node: {
            __typename: 'Feedback',
            id: FEEDBACK_ID,
            body: {
              text: '<mock-value-for-field-"text">',
            },
            author: {
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                markdown: 'mock value',
                data: {
                  markup: 'mock value',
                },
                __module_component_FeedbackFragment:
                  '<mock-value-for-field-"__module_component_FeedbackFragment">',
                __module_operation_FeedbackFragment:
                  '<mock-value-for-field-"__module_operation_FeedbackFragment">',
              },
              plainNameRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_FeedbackFragment:
                  '<mock-value-for-field-"__module_component_FeedbackFragment">',
                __module_operation_FeedbackFragment:
                  '<mock-value-for-field-"__module_operation_FeedbackFragment">',
              },
              id: '<User-mock-id-1>',
            },
          },
        },
      });
      expect(operationLoader.load).toBeCalled();
      operationLoader.load.mockClear();

      // We still processing follow-up payloads for the initial query
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(
          QueryOperation1.request,
        ),
      ).toBeInstanceOf(Promise);
      jest.runAllTimers();

      // All followup completed, operation tracker should be completed
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(
          QueryOperation1.request,
        ),
      ).toBe(null);

      // Send the mutation
      environment
        .executeMutation({
          operation: MutationOperation,
        })
        .subscribe({});

      environment.mock.nextValue(MutationOperation, {
        data: {
          commentCreate: {
            feedback: {
              id: FEEDBACK_ID,
              body: {
                text: '<mock-value-for-field-"text">',
              },
              author: {
                __typename: 'User',
                nameRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_FeedbackFragment:
                    '<mock-value-for-field-"__module_component_FeedbackFragment">',
                  __module_operation_FeedbackFragment:
                    '<mock-value-for-field-"__module_operation_FeedbackFragment">',
                },
                plainNameRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_FeedbackFragment:
                    '<mock-value-for-field-"__module_component_FeedbackFragment">',
                  __module_operation_FeedbackFragment:
                    '<mock-value-for-field-"__module_operation_FeedbackFragment">',
                },
                id: '<User-mock-id-1>',
              },
            },
          },
        },
      });

      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(
          QueryOperation1.request,
        ),
      ).toBeInstanceOf(Promise);

      environment.mock.complete(MutationOperation);
      expect(operationLoader.load).toBeCalled();
      jest.runAllTimers();
      expect(
        tracker.getPromiseForPendingOperationsAffectingOwner(
          QueryOperation1.request,
        ),
      ).toBe(null);
    });
  });
});
