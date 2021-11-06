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

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'applyMutation()',
  environmentType => {
    let commentID;
    let CommentFragment;
    let CommentQuery;
    let CreateCommentMutation;
    let CreateCommentWithSpreadMutation;
    let environment;
    let operation;
    let queryOperation;
    let source;
    let store;
    let variables;
    let queryVariables;

    describe(environmentType, () => {
      beforeEach(() => {
        commentID = 'comment-id';

        CreateCommentMutation = getRequest(graphql`
          mutation RelayModernEnvironmentApplyMutationTestMutation(
            $input: CommentCreateInput!
          ) {
            commentCreate(input: $input) {
              comment {
                id
                body {
                  text
                }
              }
            }
          }
        `);

        CommentFragment = getFragment(graphql`
          fragment RelayModernEnvironmentApplyMutationTestFragment on Comment {
            id
            body {
              text
            }
          }
        `);

        CreateCommentWithSpreadMutation = getRequest(graphql`
          mutation RelayModernEnvironmentApplyMutationTest1Mutation(
            $input: CommentCreateInput!
          ) {
            commentCreate(input: $input) {
              comment {
                ...RelayModernEnvironmentApplyMutationTestFragment
              }
            }
          }
        `);

        CommentQuery = getRequest(graphql`
          query RelayModernEnvironmentApplyMutationTest1Query($id: ID!) {
            node(id: $id) {
              id
              ...RelayModernEnvironmentApplyMutationTestFragment
            }
          }
        `);

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
        queryOperation = createOperationDescriptor(
          CommentQuery,
          queryVariables,
        );

        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(jest.fn()),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(jest.fn()),
                store,
              });
      });

      it('applies the optimistic updater immediately', () => {
        const selector = createReaderSelector(
          CommentFragment,
          commentID,
          {},
          queryOperation.request,
        );
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment.applyMutation({
          operation,
          response: null,
          updater: storeProxy => {
            const comment = storeProxy.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = storeProxy.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        });

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: commentID,
          body: {
            text: 'Give Relay',
          },
        });
      });

      it('reverts the optimistic update if disposed', () => {
        const selector = createReaderSelector(
          CommentFragment,
          commentID,
          {},
          queryOperation.request,
        );
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        const disposable = environment.applyMutation({
          operation,
          response: null,
          updater: storeProxy => {
            const comment = storeProxy.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = storeProxy.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        });
        callback.mockClear();
        disposable.dispose();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual(undefined);
      });

      it('commits optimistic response with fragment spread', () => {
        operation = createOperationDescriptor(
          CreateCommentWithSpreadMutation,
          variables,
        );

        const selector = createReaderSelector(
          CommentFragment,
          commentID,
          {},
          queryOperation.request,
        );
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment.applyMutation({
          operation,
          response: {
            commentCreate: {
              comment: {
                id: commentID,
                body: {
                  text: 'Give Relay',
                },
              },
            },
          },
          updater: null,
        });

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: commentID,
          body: {
            text: 'Give Relay',
          },
        });
      });
    });
  },
);
