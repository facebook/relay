/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest
  .dontMock('GraphQLStoreChangeEmitter')
  .mock('relayUnstableBatchedUpdates')
  .autoMockOff();

const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayOperationSelector = require('RelayOperationSelector');
const {ROOT_ID} = require('RelayStoreConstants');
const RelayTestUtils = require('RelayTestUtils');
const createRelayQuery = require('createRelayQuery');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const mapObject = require('mapObject');
const {graphql, getClassicOperation} = require('RelayGraphQLTag');
const {createOperationSelector} = require('RelayOperationSelector');

describe('RelayEnvironment', () => {
  let UserQuery;
  let environment;
  let nodeAlias;
  let photoAlias;

  function setName(id, name) {
    environment.getStoreData().getNodeData()[id].name = name;
    environment.getStoreData().getChangeEmitter().broadcastChangeForID(id);
    jest.runAllTimers();
  }

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);

    environment = new RelayEnvironment();

    UserQuery = getClassicOperation(
      graphql`
      query RelayEnvironmentUserQuery($id: ID!, $size: Int) {
        user: node(id: $id) {
          id
          name
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `,
    );

    nodeAlias = generateRQLFieldAlias('node.user.id(4)');
    photoAlias = generateRQLFieldAlias('profilePicture.size(1)');
    environment.commitPayload(
      createOperationSelector(UserQuery, {id: '4', size: 1}),
      {
        [nodeAlias]: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          [photoAlias]: {
            uri: 'https://4.jpg',
          },
        },
      },
    );
    jest.runAllTimers();
  });

  describe('applyMutation()', () => {
    let FeedbackQuery, FeedbackMutation;

    beforeEach(() => {
      FeedbackQuery = getClassicOperation(
        graphql`
        query RelayEnvironmentFeedbackQuery($id: ID!) {
          feedback: node(id: $id) {
            id
            ... on Feedback {
              doesViewerLike
            }
          }
        }
      `,
      );

      nodeAlias = generateRQLFieldAlias('node.feedback.id(123)');
      environment.commitPayload(
        createOperationSelector(FeedbackQuery, {id: '123'}),
        {
          [nodeAlias]: {
            id: '123',
            __typename: 'Feedback',
            doesViewerLike: false,
          },
        },
      );

      FeedbackMutation = getClassicOperation(
        graphql`
        mutation RelayEnvironmentFeedbackMutation($input: FeedbackLikeData!) {
          feedbackLike {
            clientMutationId
            feedback {
              id
              doesViewerLike
            }
          }
        }
      `,
      );
      jest.runAllTimers();
    });
    it('applies and disposes the optimistic response', () => {
      const disposable = environment.applyMutation({
        configs: [],
        operation: FeedbackMutation,
        optimisticResponse: {
          feedback: {
            id: '123',
            __typename: 'Feedback',
            doesViewerLike: true,
          },
        },
        variables: {
          input: {
            actor_id: '4',
            client_mutation_id: '0',
            feedback_id: '123',
          },
        },
      });
      const selector = {
        dataID: ROOT_ID,
        node: FeedbackQuery.node,
        variables: {id: '123'},
      };
      const snapshot = environment.lookup(selector);
      expect(snapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        feedback: {
          __dataID__: '123',
          id: '123',
          doesViewerLike: true, // `true` from optimistic response.
          __mutationStatus__: '0:UNCOMMITTED',
          __status__: 1,
        },
      });

      disposable.dispose();
      jest.runAllTimers();

      const disposedSnapshot = environment.lookup(selector);
      expect(disposedSnapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        feedback: {
          __dataID__: '123',
          id: '123',
          doesViewerLike: false, // reverted to `false`.
        },
      });
    });
  });

  describe('lookup()', () => {
    it('returns the results of executing a query', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      expect(snapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Zuck',
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
    });
  });

  describe('sendMutation()', () => {
    let FeedbackQuery, FeedbackMutation;
    let disposable, onCompleted, onError, sendMutation, requests, result;

    beforeEach(() => {
      requests = [];
      sendMutation = jest.fn(request => {
        requests.push(request);
        return request;
      });
      environment.injectNetworkLayer({sendMutation});

      FeedbackQuery = getClassicOperation(
        graphql`
        query RelayEnvironmentFeedbackQuery($id: ID!) {
          feedback: node(id: $id) {
            id
            ... on Feedback {
              doesViewerLike
            }
          }
        }
      `,
      );

      nodeAlias = generateRQLFieldAlias('node.feedback.id(123)');
      environment.commitPayload(
        createOperationSelector(FeedbackQuery, {id: '123'}),
        {
          [nodeAlias]: {
            id: '123',
            __typename: 'Feedback',
            doesViewerLike: false,
          },
        },
      );

      FeedbackMutation = getClassicOperation(
        graphql`
        mutation RelayEnvironmentFeedbackMutation($input: FeedbackLikeData!) {
          feedbackLike {
            clientMutationId
            feedback {
              id
              doesViewerLike
            }
          }
        }
      `,
      );
      jest.runAllTimers();

      onCompleted = jest.fn();
      onError = jest.fn();
      disposable = environment.sendMutation({
        configs: [],
        operation: FeedbackMutation,
        onCompleted,
        onError,
        optimisticResponse: {
          feedback: {
            id: '123',
            __typename: 'Feedback',
            doesViewerLike: true,
          },
        },
        variables: {
          input: {
            actor_id: '4',
            client_mutation_id: '0',
            feedback_id: '123',
          },
        },
      });
      result = {
        response: {
          feedbackLike: {
            clientMutationId: '0',
            feedback: {
              id: '123',
              doesViewerLike: true,
            },
          },
        },
      };
    });

    it('applies optimistic response and sends server mutation', () => {
      const selector = {
        dataID: ROOT_ID,
        node: FeedbackQuery.node,
        variables: {id: '123'},
      };
      const snapshot = environment.lookup(selector);
      expect(snapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        feedback: {
          __dataID__: '123',
          id: '123',
          doesViewerLike: true, // `true` from optimistic response.
          __mutationStatus__: '1:COMMITTING',
          __status__: 1,
        },
      });
      expect(sendMutation.mock.calls.length).toBe(1);
      const request = requests[0];
      request.resolve(result);
      jest.runAllTimers();

      const resolvedSnapshot = environment.lookup(selector);
      expect(resolvedSnapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        feedback: {
          __dataID__: '123',
          id: '123',
          doesViewerLike: true,
        },
      });
      expect(onCompleted).toBeCalledWith(result.response);
      expect(onError).not.toBeCalled();
    });

    it('applies changes but do not call callbacks after mutation has been disposed', () => {
      const selector = {
        dataID: ROOT_ID,
        node: FeedbackQuery.node,
        variables: {id: '123'},
      };

      disposable.dispose();
      const request = requests[0];

      request.resolve(result);
      jest.runAllTimers();

      const disposedSnapshot = environment.lookup(selector);
      expect(disposedSnapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        feedback: {
          __dataID__: '123',
          id: '123',
          doesViewerLike: true,
        },
      });
      expect(onCompleted).not.toBeCalled();
      expect(onError).not.toBeCalled();
    });
  });

  describe('subscribe()', () => {
    it('calls the callback if data changes', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);
      expect(callback).not.toBeCalled();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback.mock.calls.length).toBe(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot.data).toEqual({
        __dataID__: jasmine.any(String),
        user: {
          __dataID__: '4',
          id: '4',
          name: 'Mark', // updated value
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
      expect(nextSnapshot.data).not.toBe(snapshot.data);
      expect(nextSnapshot.data.user).not.toBe(snapshot.data.user);
      // Unchanged portions of the results are === to previous values
      expect(nextSnapshot.data.user.profilePicture).toBe(
        snapshot.data.user.profilePicture,
      );
    });

    it('does not call the callback if disposed', () => {
      const selector = {
        dataID: ROOT_ID,
        node: UserQuery.node,
        variables: {id: '4', size: 1},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      const {dispose} = environment.subscribe(snapshot, callback);
      dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
    });
  });

  // In the classic core these functions intentionally have the same behavior
  ['sendQuery', 'streamQuery'].forEach(functionName => {
    describe(functionName + '()', () => {
      let callbacks;
      let deferred;
      let sendQueries;
      let onCompleted;
      let onError;
      let onNext;
      let operation;

      beforeEach(() => {
        onCompleted = jest.fn();
        onError = jest.fn();
        onNext = jest.fn();
        callbacks = {onCompleted, onError, onNext};

        sendQueries = jest.fn(queries => {
          expect(queries.length).toBe(1);
          deferred = queries[0];
        });
        environment.injectNetworkLayer({
          sendMutation: jest.fn(),
          sendQueries,
          supports: jest.fn(() => false),
        });
        operation = RelayOperationSelector.createOperationSelector(UserQuery, {
          id: '4',
          size: 1,
        });
      });

      it('fetches queries', () => {
        environment[functionName]({operation});
        expect(sendQueries.mock.calls.length).toBe(1);
        const request = sendQueries.mock.calls[0][0][0];
        expect(request.getQuery().getConcreteQueryNode()).toBe(UserQuery.node);
        expect(request.getQuery().getVariables()).toEqual({
          id: '4',
          size: 1,
        });
      });

      it('calls onCompleted() when the batch completes', () => {
        environment[functionName]({
          ...callbacks,
          operation,
        });
        deferred.resolve({
          response: {
            [nodeAlias]: {
              id: '4',
              __typename: 'User',
              name: 'Zuck',
              [photoAlias]: {
                uri: 'https://4.jpg',
              },
            },
          },
        });
        jest.runAllTimers();
        expect(onCompleted.mock.calls.length).toBe(1);
        expect(onNext.mock.calls.length).toBe(1);
        expect(onError).not.toBeCalled();
      });

      it('calls onError() when the batch has an error', () => {
        environment[functionName]({
          ...callbacks,
          operation,
        });
        const error = new Error('wtf');
        deferred.reject(error);
        jest.runAllTimers();

        expect(onError).toBeCalled();
        expect(onCompleted).not.toBeCalled();
        expect(onNext.mock.calls.length).toBe(0);
      });

      it('calls onNext() and publishes payloads to the store', () => {
        const selector = {
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {id: '4', size: 1},
        };
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment[functionName]({
          ...callbacks,
          operation,
        });
        const response = {
          [nodeAlias]: {
            id: '4',
            __typename: 'User',
            name: 'Mark', // Zuck -> Mark
            [photoAlias]: {
              uri: 'https://4.jpg',
            },
          },
        };
        deferred.resolve({response});
        jest.runAllTimers();

        expect(onNext.mock.calls.length).toBe(1);
        expect(onNext).toBeCalledWith({
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {id: '4', size: 1},
        });
        expect(onCompleted).toBeCalled();
        expect(onError).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          __dataID__: jasmine.any(String),
          user: {
            __dataID__: '4',
            id: '4',
            name: 'Mark', // Reflects changed value
            profilePicture: {
              __dataID__: jasmine.any(String),
              uri: 'https://4.jpg',
            },
          },
        });
      });

      it('supports multiple root fields', () => {
        UserQuery = getClassicOperation(
          graphql`
          query RelayEnvironmentUserQuery {
            viewer {
              actor {
                id
              }
            }
            user: node(id: "4") {
              name
            }
          }
        `,
        );
        operation = RelayOperationSelector.createOperationSelector(
          UserQuery,
          {},
        );
        const selector = {
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        };
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment[functionName]({
          ...callbacks,
          operation,
        });
        const response = {
          viewer: {
            actor: {
              id: '4',
              __typename: 'User',
            },
          },
          [nodeAlias]: {
            id: '4',
            name: 'Mark', // Zuck -> Mark
          },
        };
        deferred.resolve({response});
        jest.runAllTimers();

        expect(onNext.mock.calls.length).toBe(1);
        expect(onNext).toBeCalledWith({
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        });
        expect(onCompleted).toBeCalled();
        expect(onError).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);

        const recordStore = environment.getStoreData().getRecordStore();
        const viewerID = recordStore.getDataID('viewer');
        expect(recordStore.getPathToRecord(viewerID).type).toBe('root');
        expect(callback.mock.calls[0][0].data).toEqual({
          __dataID__: jasmine.any(String),
          viewer: {
            __dataID__: viewerID,
            actor: {
              __dataID__: '4',
              id: '4',
            },
          },
          user: {
            __dataID__: '4',
            name: 'Mark', // Reflects changed value
          },
        });
      });

      it('ignores empty fields', () => {
        UserQuery = getClassicOperation(
          graphql`
          query RelayEnvironmentUserQuery {
            viewer {
              actor @include(if: false) {
                id
              }
            }
          }
        `,
        );
        operation = RelayOperationSelector.createOperationSelector(
          UserQuery,
          {},
        );
        const selector = {
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        };
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment[functionName]({
          ...callbacks,
          operation,
        });
        // The printed query (and therefore the server response) won't have a
        // `viewer` field.
        const response = {
          __typename: 'Query',
        };
        deferred.resolve({response});
        jest.runAllTimers();

        expect(onNext.mock.calls.length).toBe(1);
        expect(onNext).toBeCalledWith({
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        });
        expect(onCompleted).toBeCalled();
        expect(onError).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(0);

        const recordStore = environment.getStoreData().getRecordStore();
        const viewerID = recordStore.getDataID('viewer');
        expect(viewerID).toBe(undefined);
      });

      it('writes id-less root fields (e.g. viewer)', () => {
        UserQuery = getClassicOperation(
          graphql`
          query RelayEnvironmentUserQuery {
            viewer {
              actor {
                id
                name
              }
            }
          }
        `,
        );
        operation = RelayOperationSelector.createOperationSelector(
          UserQuery,
          {},
        );
        const selector = {
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        };
        const snapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        environment[functionName]({
          ...callbacks,
          operation,
        });
        const response = {
          viewer: {
            actor: {
              id: '4',
              __typename: 'User',
              name: 'Mark', // Zuck -> Mark
            },
          },
        };
        deferred.resolve({response});
        jest.runAllTimers();

        expect(onNext.mock.calls.length).toBe(1);
        expect(onNext).toBeCalledWith({
          dataID: ROOT_ID,
          node: UserQuery.node,
          variables: {},
        });
        expect(onCompleted).toBeCalled();
        expect(onError).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);

        const recordStore = environment.getStoreData().getRecordStore();
        const viewerID = recordStore.getDataID('viewer');
        expect(recordStore.getPathToRecord(viewerID).type).toBe('root');
        expect(callback.mock.calls[0][0].data).toEqual({
          __dataID__: jasmine.any(String),
          viewer: {
            __dataID__: viewerID,
            actor: {
              __dataID__: '4',
              id: '4',
              name: 'Mark', // Reflects changed value
            },
          },
        });
      });

      it('force-fetches data', () => {
        // Populate initial data for the query
        const FriendsQuery = getClassicOperation(
          graphql`
          query RelayEnvironmentFriendsQuery($id: ID!) {
            user: node(id: $id) {
              id
              friends(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        );

        nodeAlias = generateRQLFieldAlias('node.user.id(4)');
        const friendsAlias = generateRQLFieldAlias('friends.first(1)');
        operation = RelayOperationSelector.createOperationSelector(
          FriendsQuery,
          {id: '4'},
        );
        environment.commitPayload(operation, {
          [nodeAlias]: {
            id: '4',
            __typename: 'User',
            [friendsAlias]: {
              edges: [
                {
                  cursor: 'cursor:beast',
                  node: {
                    id: 'beast',
                  },
                },
              ],
              pageInfo: {
                hasPreviousPage: false,
                hasNextPage: true,
                startCursor: 'cursor:beast',
                endCursor: 'cursor:beast',
              },
            },
          },
        });
        jest.runAllTimers();
        const snapshot = environment.lookup(operation.fragment);
        const callback = jest.fn();
        environment.subscribe(snapshot, callback);

        // Force-fetch, connection edges should be replaced
        environment[functionName]({
          ...callbacks,
          cacheConfig: {force: true},
          operation,
        });
        const response = {
          [nodeAlias]: {
            id: '4',
            __typename: 'User',
            [friendsAlias]: {
              edges: [
                {
                  cursor: 'cursor:foo',
                  node: {
                    id: 'foo', // different node: beast -> foo
                  },
                },
              ],
              pageInfo: {
                hasPreviousPage: false,
                hasNextPage: true,
                startCursor: 'cursor:foo',
                endCursor: 'cursor:foo',
              },
            },
          },
        };
        deferred.resolve({response});
        jest.runAllTimers();

        expect(onNext.mock.calls.length).toBe(1);
        expect(onNext).toBeCalledWith(operation.root);
        expect(onCompleted).toBeCalled();
        expect(onError).not.toBeCalled();
        expect(callback.mock.calls.length).toBe(1);

        // New payload causes selector results to change, has the updated edges
        expect(callback.mock.calls[0][0].data).toEqual({
          __dataID__: jasmine.any(String),
          user: {
            __dataID__: '4',
            id: '4',
            friends: {
              __dataID__: jasmine.any(String),
              edges: [
                {
                  __dataID__: jasmine.any(String),
                  node: {
                    // beast -> foo
                    __dataID__: 'foo',
                    id: 'foo',
                  },
                },
              ],
            },
          },
        });
      });
    });
  });

  describe('integration tests', () => {
    let Container;
    let Query;
    let deferred;
    let fragments;
    let sendQueries;
    let operation;

    beforeEach(() => {
      fragments = {
        user: graphql`
          fragment RelayEnvironment_user on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }
        `,
      };
      Container = {
        getFragment(fragmentName, args) {
          return {
            kind: 'FragmentSpread',
            args: args || {},
            fragment: environment.unstable_internal.getFragment(
              fragments[fragmentName],
            ),
          };
        },
      };
      Query = environment.unstable_internal.getOperation(
        graphql`
        query RelayEnvironmentUserQuery($id: ID!, $size: Int) {
          user: node(id: $id) {
            ...Container_user
          }
        }
      `,
      );

      sendQueries = jest.fn(queries => {
        expect(queries.length).toBe(1);
        deferred = queries[0];
      });
      environment.injectNetworkLayer({
        sendMutation: jest.fn(),
        sendQueries,
        supports: jest.fn(() => false),
      });
      operation = environment.unstable_internal.createOperationSelector(Query, {
        id: '4',
        size: 1,
      });
    });

    it('resolves fragment data with classic readQuery()', () => {
      environment.sendQuery({operation});
      deferred.resolve({
        response: {
          [nodeAlias]: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            [photoAlias]: {
              uri: 'https://4.jpg',
            },
          },
        },
      });
      jest.runAllTimers();

      const query = createRelayQuery(
        Relay.QL`
        query {
          node(id: $id) {
            ${Container.getFragment('user')}
          }
        }
      `,
        {id: '4', size: 1},
      );

      // read the parent data using `readQuery()`
      const user = environment.readQuery(query)[0];
      const context = {
        environment,
        variables: {id: '4', size: 1},
      };
      const resolver = environment.unstable_internal.createFragmentSpecResolver(
        context,
        'TestContainerName',
        mapObject(fragments, environment.unstable_internal.getFragment),
        {user},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: {
          __dataID__: '4',
          name: 'Zuck',
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
    });

    it('resolves fragment data with lookup()', () => {
      environment.sendQuery({operation});
      deferred.resolve({
        response: {
          [nodeAlias]: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            [photoAlias]: {
              uri: 'https://4.jpg',
            },
          },
        },
      });
      jest.runAllTimers();

      // read the parent data using `lookup()`
      const user = environment.lookup(operation.root).data.user;
      const context = {
        environment,
        variables: {id: '4', size: 1},
      };
      const resolver = environment.unstable_internal.createFragmentSpecResolver(
        context,
        'TestContainerName',
        mapObject(fragments, environment.unstable_internal.getFragment),
        {user},
        jest.fn(),
      );
      expect(resolver.resolve()).toEqual({
        user: {
          __dataID__: '4',
          name: 'Zuck',
          profilePicture: {
            __dataID__: jasmine.any(String),
            uri: 'https://4.jpg',
          },
        },
      });
    });
  });
});
