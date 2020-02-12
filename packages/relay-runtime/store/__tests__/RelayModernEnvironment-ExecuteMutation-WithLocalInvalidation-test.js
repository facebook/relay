/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('executeMutation() with local invalidation', () => {
  let callbacks;
  let commentID;
  let CommentFragment;
  let CommentQuery;
  let complete;
  let CreateCommentMutation;
  let environment;
  let error;
  let fetch;
  let operation;
  let queryOperation;
  let source;
  let store;
  let subject;
  let variables;
  let queryVariables;

  beforeEach(() => {
    jest.resetModules();
    commentID = 'comment-id';

    ({
      CreateCommentMutation,
      CommentFragment,
      CommentQuery,
    } = generateAndCompile(`
        mutation CreateCommentMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              id
              body {
                text
              }
            }
          }
        }

        fragment CommentFragment on Comment {
          id
          body {
            text
          }
        }

        query CommentQuery($id: ID!) {
          node(id: $id) {
            id
            ...CommentFragment
          }
        }
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    queryVariables = {
      id: commentID,
    };
    operation = createOperationDescriptor(CreateCommentMutation, variables);
    queryOperation = createOperationDescriptor(CommentQuery, queryVariables);

    fetch = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        subject = sink;
      }),
    );
    source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"comment-id")': {__ref: 'comment-id'},
      },
    });
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
    complete = jest.fn();
    error = jest.fn();
    callbacks = {complete, error};
  });

  it('local invalidation is a no-op if called during optimistic update', () => {
    const selector = createReaderSelector(
      CommentFragment,
      commentID,
      {},
      queryOperation.request,
    );
    const snapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(snapshot, callback);

    environment
      .executeMutation({
        operation,
        optimisticUpdater: _store => {
          const comment = _store.create(commentID, 'Comment');
          comment.setValue(commentID, 'id');
          const body = _store.create(commentID + '.text', 'Text');
          comment.setLinkedRecord(body, 'body');
          body.setValue('Give Relay', 'text');

          // Invalidate record
          comment.invalidateRecord();
        },
      })
      .subscribe(callbacks);
    // Results of execution are asserted in ExecuteMutation-test.js

    // Assert that store invalidation during optimistic update
    // was a no-op
    expect(environment.check(queryOperation)).toEqual({
      status: 'available',
      fetchTime: null,
    });
  });

  describe('when record invalidated inside updater after server payload', () => {
    it('correctly invalidates the record when query has never been written before', () => {
      const selector = createReaderSelector(
        CommentFragment,
        commentID,
        {},
        queryOperation.request,
      );
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          updater: _store => {
            const comment = _store.get(commentID);
            if (!comment) {
              throw new Error('Expected comment to be in the store');
            }
            const body = comment.getLinkedRecord('body');
            if (!body) {
              throw new Error('Expected comment to have a body');
            }
            const bodyValue: string = (body.getValue('text'): $FlowFixMe);
            if (bodyValue == null) {
              throw new Error('Expected comment body to have text');
            }
            body.setValue(bodyValue.toUpperCase(), 'text');

            // Invalidate record
            comment.invalidateRecord();
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
            },
          },
        },
      });
      subject.complete();

      // Results of execution are asserted in ExecuteMutation-test.js

      // Assert that store was correctly invalidated
      expect(environment.check(queryOperation)).toEqual({status: 'stale'});
      // Assert that operation that was written during the same update as invalidation
      // is also stale
      expect(environment.check(operation)).toEqual({status: 'stale'});
    });

    it('correctly invalidates the record when query was written before invalidation', () => {
      // Write operation before running invalidation
      environment.retain(queryOperation);
      environment.commitPayload(queryOperation, {
        node: {
          __typename: 'Comment',
          id: commentID,
          body: {
            text: 'Foo',
          },
        },
      });
      jest.runAllTimers();

      // Execute mutation
      const selector = createReaderSelector(
        CommentFragment,
        commentID,
        {},
        queryOperation.request,
      );
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          updater: _store => {
            const comment = _store.get(commentID);
            if (!comment) {
              throw new Error('Expected comment to be in the store');
            }
            const body = comment.getLinkedRecord('body');
            if (!body) {
              throw new Error('Expected comment to have a body');
            }
            const bodyValue: string = (body.getValue('text'): $FlowFixMe);
            if (bodyValue == null) {
              throw new Error('Expected comment body to have text');
            }
            body.setValue(bodyValue.toUpperCase(), 'text');

            // Invalidate record
            comment.invalidateRecord();
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
            },
          },
        },
      });
      subject.complete();
      // Results of execution are asserted in ExecuteMutation-test.js

      // Assert that store was correctly invalidated
      expect(environment.check(queryOperation)).toEqual({status: 'stale'});
      // Assert that operation that was written during the same update as invalidation
      // is also stale
      expect(environment.check(operation)).toEqual({status: 'stale'});
    });

    it('correctly invalidates the record when query is written after invalidation', () => {
      // Execute mutation
      const selector = createReaderSelector(
        CommentFragment,
        commentID,
        {},
        queryOperation.request,
      );
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          updater: _store => {
            const comment = _store.get(commentID);
            if (!comment) {
              throw new Error('Expected comment to be in the store');
            }
            const body = comment.getLinkedRecord('body');
            if (!body) {
              throw new Error('Expected comment to have a body');
            }
            const bodyValue: string = (body.getValue('text'): $FlowFixMe);
            if (bodyValue == null) {
              throw new Error('Expected comment body to have text');
            }
            body.setValue(bodyValue.toUpperCase(), 'text');

            // Invalidate record
            comment.invalidateRecord();
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
            },
          },
        },
      });
      subject.complete();
      jest.runAllTimers();
      // Results of execution are asserted in ExecuteMutation-test.js

      // Assert that query is currently stale
      expect(environment.check(queryOperation)).toEqual({status: 'stale'});
      // Assert that operation that was written during the same update as invalidation
      // is also stale
      expect(environment.check(operation)).toEqual({status: 'stale'});

      // Write operation after running invalidation
      environment.retain(queryOperation);
      const fetchTime = Date.now();
      jest.spyOn(global.Date, 'now').mockImplementation(() => fetchTime);
      environment.commitPayload(queryOperation, {
        node: {
          __typename: 'Comment',
          id: commentID,
          body: {
            text: 'Foo',
          },
        },
      });
      jest.runAllTimers();
      // Assert that query is currently available
      expect(environment.check(queryOperation)).toEqual({
        status: 'available',
        fetchTime,
      });
      // Assert that operation that was written during the same update as invalidation
      // is still stale
      expect(environment.check(operation)).toEqual({status: 'stale'});
    });
  });
});
