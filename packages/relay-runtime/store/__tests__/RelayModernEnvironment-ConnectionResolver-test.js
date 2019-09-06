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

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

import type {DataID} from '../../util/RelayRuntimeTypes';
import type {ConnectionResolver} from '../RelayConnection';

type ConnectionEdge = {|
  +cursor: ?string,
  +node: ?{[string]: mixed},
|};
type ConnectionState = {|
  +edgeData: {[DataID]: ?ConnectionEdge},
  +edgeIDs: $ReadOnlyArray<?DataID>,
  +edges: $ReadOnlyArray<?ConnectionEdge>,
  +pageInfo: {
    endCursor: ?string,
    hasNextPage: ?boolean,
    hasPrevPage: ?boolean,
    startCursor: ?string,
  },
|};

describe('@connection_resolver connection field', () => {
  let CommentCreateMutation;
  let connectionResolver: ConnectionResolver<ConnectionEdge, ConnectionState>;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let next;
  let operation;
  let paginationQuery;
  let query;
  let snapshot;
  let source;
  let store;

  let enableConnectionResolvers;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    enableConnectionResolvers = RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS;
    RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = true;

    connectionResolver = {
      initialize() {
        return {
          edgeIDs: [],
          edgeData: {},
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: null,
            hasPrevPage: null,
            startCursor: null,
          },
        };
      },
      reduce: jest.fn((state, event) => {
        let nextEdgeIDs = state.edgeIDs;
        let nextEdgeData = state.edgeData;
        let nextPageInfo = state.pageInfo;
        switch (event.kind) {
          case 'fetch': {
            const {args} = event;
            if (args.after != null) {
              nextEdgeIDs = [...state.edgeIDs, ...event.edgeIDs];
              nextPageInfo = {
                ...state.pageInfo,
                hasNextPage: event.pageInfo.hasNextPage,
                endCursor: event.pageInfo.endCursor,
              };
            } else if (args.before != null) {
              nextEdgeIDs = [...event.edgeIDs, ...state.edgeIDs];
              nextPageInfo = {
                ...state.pageInfo,
                hasPrevPage: event.pageInfo.hasPrevPage,
                startCursor: event.pageInfo.startCursor,
              };
            } else {
              nextEdgeIDs = event.edgeIDs;
              nextPageInfo = event.pageInfo;
            }
            nextEdgeData = {...state.edgeData, ...event.edgeData};
            break;
          }
          case 'insert': {
            nextEdgeIDs = [...state.edgeIDs, event.edgeID];
            nextEdgeData = {...state.edgeData};
            nextEdgeData[event.edgeID] = event.edge;
            nextPageInfo = {
              ...state.pageInfo,
              endCursor: event.edge?.cursor ?? state.pageInfo.endCursor,
            };
            break;
          }
          case 'update': {
            nextEdgeData = {...state.edgeData, ...event.edgeData};
            break;
          }
          default:
            (event.kind: empty);
            invariant(
              false,
              'ConnectionResolver-test: Unhandled event kind `%s`.',
              event.kind,
            );
        }
        const nextEdges = [];
        const filteredEdgeIDs = [];
        nextEdgeIDs.forEach(edgeID => {
          if (edgeID != null) {
            const edgeData = nextEdgeData[edgeID];
            if (edgeData != null && edgeData.node != null) {
              filteredEdgeIDs.push(edgeID);
              nextEdges.push(edgeData);
            }
          }
        });
        return {
          edgeData: nextEdgeData,
          edgeIDs: filteredEdgeIDs,
          edges: nextEdges,
          pageInfo: nextPageInfo,
        };
      }),
    };
    ({
      CommentCreateMutation,
      FeedbackQuery: query,
      FeedbackFragment: fragment,
      PaginationQuery: paginationQuery,
    } = generateAndCompile(
      `
      query FeedbackQuery($id: ID!) {
        node(id: $id) {
          ...FeedbackFragment
        }
      }

      mutation CommentCreateMutation($input: CommentCreateInput) {
        commentCreate(input: $input) {
          feedbackCommentEdge {
            cursor
            node {
              id
              message { text }
            }
          }
        }
      }

      query PaginationQuery(
        $id: ID!
        $count: Int
        $cursor: ID
        $beforeCount: Int
        $beforeCursor: ID
      ) {
        node(id: $id) {
          ...FeedbackFragment @arguments(
            count: $count
            cursor: $cursor
            beforeCount: $beforeCount
            beforeCursor: $beforeCursor
          )
        }
      }

      fragment FeedbackFragment on Feedback @argumentDefinitions(
        count: {type: "Int", defaultValue: 2},
        cursor: {type: "ID"}
        beforeCount: {type: "Int"},
        beforeCursor: {type: "ID"}
      ) {
        id
        comments(
          after: $cursor
          before: $beforeCursor
          first: $count
          last: $beforeCount
          orderby: "date"
        ) @connection_resolver(resolver: "connectionResolver") {
          edges {
            cursor
            node {
              id
              message { text }
              ...CommentFragment
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }

      fragment CommentFragment on Comment {
        id
      }
    `,
      null,
      {
        connectionResolver,
      },
    ));
    const variables = {
      id: '<feedbackid>',
    };
    operation = createOperationDescriptor(query, variables);

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = jest.fn((_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    });
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = enableConnectionResolvers;
  });

  it('loads the resolver object for a ConnectionField', () => {
    const connectionField = fragment.selections.find(
      selection => selection.kind === 'ConnectionField',
    );
    expect(connectionField.name).toBe('comments');
    expect(connectionField.label).toBe('FeedbackFragment$connection$comments');
    expect(connectionField.resolver).toBe(connectionResolver);
  });

  it('publishes initial results to the store', () => {
    const operationSnapshot = environment.lookup(operation.fragment);
    const operationCallback = jest.fn();
    environment.subscribe(operationSnapshot, operationCallback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'Feedback',
          id: '<feedbackid>',
          comments: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Comment',
                  id: 'node-1',
                  message: {text: 'Comment 1'},
                },
              },
              {
                cursor: 'cursor-2',
                node: {
                  __typename: 'Comment',
                  id: 'node-2',
                  message: {text: 'Comment 2'},
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor-2',
              hasNextPage: true,
              hasPreviousPage: null,
              startCursor: 'cursor-1',
            },
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(callbacks.error.mock.calls.map(call => call[0].message)).toEqual([]);
    expect(operationCallback).toBeCalledTimes(1);
    const nextOperationSnapshot = operationCallback.mock.calls[0][0];
    expect(nextOperationSnapshot.isMissingData).toBe(false);
    expect(nextOperationSnapshot.data).toEqual({
      node: {
        __id: '<feedbackid>',
        __fragments: {
          FeedbackFragment: {},
        },
        __fragmentOwner: operation.request,
      },
    });

    const selector = nullthrows(
      getSingularSelector(fragment, nextOperationSnapshot.data?.node),
    );
    snapshot = environment.lookup(selector);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '<feedbackid>',
      comments: {
        __connection: expect.objectContaining({
          id: 'connection:<feedbackid>:FeedbackFragment$connection$comments',
        }),
      },
    });
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (snapshot.data: $FlowFixMe).comments.__connection,
      );
    expect(connectionSnapshot.state).toEqual(
      expect.objectContaining({
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        },
      }),
    );
    expect(connectionResolver.reduce).toBeCalledTimes(1);
  });

  describe('after initial data has been fetched and subscribed', () => {
    let callback;
    let connectionCallback;
    let connectionSnapshot;
    let connectionSubscription;

    beforeEach(() => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1',
                    message: {text: 'Comment 1'},
                  },
                },
                {
                  cursor: 'cursor-2',
                  node: {
                    __typename: 'Comment',
                    id: 'node-2',
                    message: {text: 'Comment 2'},
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor-2',
                hasNextPage: true,
                hasPreviousPage: null,
                startCursor: 'cursor-1',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      dataSource.complete();
      fetch.mockClear();
      jest.runAllTimers();

      const operationSnapshot = environment.lookup(operation.fragment);

      const selector = nullthrows(
        getSingularSelector(fragment, operationSnapshot.data?.node),
      );
      snapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(snapshot, callback);

      connectionSnapshot = environment
        .getStore()
        .lookupConnection_UNSTABLE(
          (snapshot.data: $FlowFixMe).comments.__connection,
        );
      connectionCallback = jest.fn();
      connectionSubscription = environment
        .getStore()
        .subscribeConnection_UNSTABLE(connectionSnapshot, connectionCallback);
      connectionResolver.reduce.mockClear();
    });

    it('updates when paginated forward', () => {
      const paginationOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
        count: 2,
        cursor: 'cursor-2',
      });
      environment.execute({operation: paginationOperation}).subscribe({});
      const paginationPayload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-3',
                  node: {
                    __typename: 'Comment',
                    id: 'node-3',
                    message: {text: 'Comment 3'},
                  },
                },
                {
                  cursor: 'cursor-4',
                  node: {
                    __typename: 'Comment',
                    id: 'node-4',
                    message: {text: 'Comment 4'},
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor-4',
                hasNextPage: true,
                hasPreviousPage: null,
                startCursor: 'cursor-3',
              },
            },
          },
        },
      };
      dataSource.next(paginationPayload);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(0);

      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: 'node-1',
                message: {text: 'Comment 1'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-1',
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                id: 'node-2',
                message: {text: 'Comment 2'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2',
              },
            },
            {
              cursor: 'cursor-3',
              node: {
                id: 'node-3',
                message: {text: 'Comment 3'},
                __fragmentOwner: paginationOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-3',
              },
            },
            {
              cursor: 'cursor-4',
              node: {
                id: 'node-4',
                message: {text: 'Comment 4'},
                __fragmentOwner: paginationOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-4',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-4',
            hasNextPage: true,
            hasPrevPage: null,
            startCursor: 'cursor-1',
          },
        }),
      );
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    it('updates when paginated backward', () => {
      const paginationOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
        beforeCount: 2,
        beforeCursor: 'cursor-1',
      });
      environment.execute({operation: paginationOperation}).subscribe({});
      const paginationPayload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-y',
                  node: {
                    __typename: 'Comment',
                    id: 'node-y',
                    message: {text: 'Comment Y'},
                  },
                },
                {
                  cursor: 'cursor-z',
                  node: {
                    __typename: 'Comment',
                    id: 'node-z',
                    message: {text: 'Comment Z'},
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor-z',
                hasNextPage: true,
                hasPreviousPage: true,
                startCursor: 'cursor-y',
              },
            },
          },
        },
      };
      dataSource.next(paginationPayload);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(0);

      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-y',
              node: {
                id: 'node-y',
                message: {text: 'Comment Y'},
                __fragmentOwner: paginationOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-y',
              },
            },
            {
              cursor: 'cursor-z',
              node: {
                id: 'node-z',
                message: {text: 'Comment Z'},
                __fragmentOwner: paginationOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-z',
              },
            },
            {
              cursor: 'cursor-1',
              node: {
                id: 'node-1',
                message: {text: 'Comment 1'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-1',
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                id: 'node-2',
                message: {text: 'Comment 2'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-2',
            hasNextPage: true,
            hasPrevPage: true,
            startCursor: 'cursor-y',
          },
        }),
      );
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    it('resets state when refetched', () => {
      const refetchOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
        count: 2,
        cursor: null,
      });
      environment.execute({operation: refetchOperation}).subscribe({});
      const refetchPayload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-1a',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1a',
                    message: {text: 'Comment 1A'},
                  },
                },
                {
                  cursor: 'cursor-2a',
                  node: {
                    __typename: 'Comment',
                    id: 'node-2a',
                    message: {text: 'Comment 2A'},
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor-2a',
                hasNextPage: true,
                hasPreviousPage: null,
                startCursor: 'cursor-1a',
              },
            },
          },
        },
      };
      dataSource.next(refetchPayload);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(0);

      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-1a',
              node: {
                id: 'node-1a',
                message: {text: 'Comment 1A'},
                __fragmentOwner: refetchOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-1a',
              },
            },
            {
              cursor: 'cursor-2a',
              node: {
                id: 'node-2a',
                message: {text: 'Comment 2A'},
                __fragmentOwner: refetchOperation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2a',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-2a',
            hasNextPage: true,
            hasPrevPage: null,
            startCursor: 'cursor-1a',
          },
        }),
      );
      // reduce is called twice since the fetch triggers an update
      expect(connectionResolver.reduce).toBeCalledTimes(2);
    });

    it('updates when a node is deleted', () => {
      environment.commitUpdate(storeProxy => {
        storeProxy.delete('node-1');
      });
      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-2',
              node: {
                id: 'node-2',
                message: {text: 'Comment 2'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-2',
            hasNextPage: true,
            hasPrevPage: null,
            startCursor: 'cursor-1',
          },
        }),
      );
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    it('updates when an edge is deleted', () => {
      const edgeID =
        'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
      environment.commitUpdate(storeProxy => {
        storeProxy.delete(edgeID);
      });
      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-2',
              node: {
                id: 'node-2',
                message: {text: 'Comment 2'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-2',
            hasNextPage: true,
            hasPrevPage: null,
            startCursor: 'cursor-1',
          },
        }),
      );
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    it('updates when edge data changes', () => {
      const edgeID =
        'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
      environment.commitUpdate(storeProxy => {
        const edge = storeProxy.get(edgeID);
        invariant(edge, 'Expected edge to exist');
        const node = edge.getLinkedRecord('node');
        invariant(node, 'Expected node to exist');
        const message = node.getLinkedRecord('message');
        invariant(message, 'Expected message to exist');
        message.setValue('Comment 1 changed!', 'text');
      });
      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot).toEqual(
        expect.objectContaining({
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: 'node-1',
                message: {text: 'Comment 1 changed!'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-1',
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                id: 'node-2',
                message: {text: 'Comment 2'},
                __fragmentOwner: operation.request,
                __fragments: {CommentFragment: {}},
                __id: 'node-2',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-2',
            hasNextPage: true,
            hasPrevPage: null,
            startCursor: 'cursor-1',
          },
        }),
      );
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    it('does not update when unrelated edge data changes', () => {
      const edgeID =
        'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
      environment.commitUpdate(storeProxy => {
        const edge = storeProxy.get(edgeID);
        invariant(edge, 'Expected edge to exist');
        const node = edge.getLinkedRecord('node');
        invariant(node, 'Expected node to exist');
        const message = node.getLinkedRecord('message');
        invariant(message, 'Expected message to exist');
        message.setValue('foo', '<not-a-field>');
      });
      expect(connectionCallback).toBeCalledTimes(0);
      expect(connectionResolver.reduce).toBeCalledTimes(0);
    });

    it('updates when an edge is inserted', () => {
      const payload = {
        data: {
          commentCreate: {
            feedbackCommentEdge: {
              cursor: 'cursor-3',
              node: {
                id: 'node-3',
                message: {text: 'Comment 3'},
              },
            },
          },
        },
        extensions: {
          is_final: true,
        },
      };
      const updater = jest.fn(storeProxy => {
        const commentCreate = storeProxy.getRootField('commentCreate');
        invariant(commentCreate, 'Expected `commentCreate` to exist');
        const edge = commentCreate.getLinkedRecord('feedbackCommentEdge');
        invariant(edge, 'Expected `feedbackCommentEdge` to exist');
        storeProxy.insertConnectionEdge_UNSTABLE(
          connectionSnapshot.id,
          {},
          edge,
        );
      });
      const mutation = createOperationDescriptor(CommentCreateMutation, {});
      environment
        .executeMutation({operation: mutation, updater})
        .subscribe(callbacks);
      dataSource.next(payload);

      expect(updater).toBeCalledTimes(1);
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(connectionCallback).toBeCalledTimes(1);
      const nextSnapshot = connectionCallback.mock.calls[0][0];
      expect(nextSnapshot.edges).toEqual([
        {
          cursor: 'cursor-1',
          node: {
            id: 'node-1',
            message: {text: 'Comment 1'},
            __fragmentOwner: operation.request,
            __fragments: {CommentFragment: {}},
            __id: 'node-1',
          },
        },
        {
          cursor: 'cursor-2',
          node: {
            id: 'node-2',
            message: {text: 'Comment 2'},
            __fragmentOwner: operation.request,
            __fragments: {CommentFragment: {}},
            __id: 'node-2',
          },
        },
        {
          cursor: 'cursor-3',
          node: {
            id: 'node-3',
            message: {text: 'Comment 3'},
            __fragmentOwner: mutation.request,
            __fragments: {CommentFragment: {}},
            __id: 'node-3',
          },
        },
      ]);
      expect(nextSnapshot.pageInfo).toEqual({
        endCursor: 'cursor-3',
        hasNextPage: true,
        hasPrevPage: null,
        startCursor: 'cursor-1',
      });
      expect(connectionResolver.reduce).toBeCalledTimes(1);
    });

    describe('optimistic edge deletion', () => {
      it('updates when an edge is deleted', () => {
        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete(edgeID);
          },
        });

        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('updates when an edge is deleted (new lookup)', () => {
        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete(edgeID);
          },
        });

        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
      });

      it('restores deleted edges to their prior state when reverted', () => {
        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete(edgeID);
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('restores deleted edges to their prior state when reverted (new lookup)', () => {
        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete(edgeID);
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
      });

      it('restores deleted edges to their prior state when reverted (subscribed on optimistic state)', () => {
        connectionSubscription.dispose();
        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete(edgeID);
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        connectionSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          );
        connectionSubscription = environment
          .getStore()
          .subscribeConnection_UNSTABLE(connectionSnapshot, connectionCallback);
        expect(connectionResolver.reduce).toBeCalledTimes(1);
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges.length).toBe(2);
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        // should re-run the reducer with just the original fetch event
        // plus an update for the reverted record
        expect(connectionResolver.reduce).toBeCalledTimes(2);
      });
    });

    describe('optimistic edge.node deletion', () => {
      it('updates when an edge node is deleted', () => {
        environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete('node-1');
          },
        });

        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('updates when an edge node is deleted (new lookup)', () => {
        environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete('node-1');
          },
        });

        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
      });

      it('restores deleted edges/nodes to their prior state when reverted', () => {
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete('node-1');
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('restores deleted edges/nodes to their prior state when reverted (new lookup)', () => {
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete('node-1');
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
      });

      it('restores deleted edges to their prior state when reverted (subscribed on optimistic state)', () => {
        connectionSubscription.dispose();
        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            storeProxy.delete('node-1');
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        connectionSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          );
        connectionSubscription = environment
          .getStore()
          .subscribeConnection_UNSTABLE(connectionSnapshot, connectionCallback);
        expect(connectionResolver.reduce).toBeCalledTimes(1);
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges.length).toBe(2);
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        // should re-run the reducer with just the original fetch event
        // plus an update for reverted edge record
        expect(connectionResolver.reduce).toBeCalledTimes(2);
      });
    });

    describe('optimistic edge inserts', () => {
      let mutation;
      let optimisticResponse;
      let optimisticUpdater;
      let subscription;

      beforeEach(() => {
        optimisticResponse = {
          commentCreate: {
            feedbackCommentEdge: {
              cursor: 'cursor-x',
              node: {
                id: 'node-x',
                message: {text: 'Comment x'},
              },
            },
          },
        };
        optimisticUpdater = jest.fn(storeProxy => {
          const commentCreate = storeProxy.getRootField('commentCreate');
          invariant(commentCreate, 'Expected `commentCreate` to exist');
          const edge = commentCreate.getLinkedRecord('feedbackCommentEdge');
          invariant(edge, 'Expected `feedbackCommentEdge` to exist');
          storeProxy.insertConnectionEdge_UNSTABLE(
            connectionSnapshot.id,
            {},
            edge,
          );
        });
        mutation = createOperationDescriptor(CommentCreateMutation, {});
        subscription = environment
          .executeMutation({
            operation: mutation,
            optimisticResponse,
            optimisticUpdater,
          })
          .subscribe(callbacks);
      });

      it('updates when an edge is optimistically inserted', () => {
        expect(optimisticUpdater).toBeCalledTimes(1);
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x',
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('reverts optimistic updates', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();
        subscription.unsubscribe();

        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // edge removed
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // reverted
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('reverts optimistic updates (new lookup)', () => {
        connectionSubscription.dispose();
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();
        subscription.unsubscribe();

        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // edge removed
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // reverted
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
      });

      it('reverts optimistic updates (subscribed on optimistic state)', () => {
        connectionSubscription.dispose();
        connectionCallback.mockClear();

        connectionSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          );
        connectionSubscription = environment
          .getStore()
          .subscribeConnection_UNSTABLE(connectionSnapshot, connectionCallback);
        expect(connectionSnapshot.state.edges.length).toBe(3);
        connectionResolver.reduce.mockClear();
        subscription.unsubscribe();

        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges.length).toBe(2);
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // edge removed
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // reverted
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('rebases optimistic inserts on edge data changes, and reverts w/o losing those changes', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        environment.commitUpdate(storeProxy => {
          const edge = storeProxy.get(edgeID);
          invariant(edge, 'Expected edge to exist');
          const node = edge.getLinkedRecord('node');
          invariant(node, 'Expected node to exist');
          const message = node.getLinkedRecord('message');
          invariant(message, 'Expected message to exist');
          message.setValue('Comment 1 changed!', 'text');
        });
        expect(connectionCallback).toBeCalledTimes(1);
        const changeSnapshot = connectionCallback.mock.calls[0][0];
        expect(changeSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1 changed!'}, // existing data changed
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x', // insert is rebased
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(changeSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x', // insert is rebased
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(2); // update + rebased insert
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        subscription.unsubscribe();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const revertSnapshot = connectionCallback.mock.calls[0][0];
        expect(revertSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1 changed!'}, // edit preserved
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // insert reverted
        ]);
        expect(revertSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // insert reverted
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('rebases optimistic inserts on edge data changes, and reverts w/o losing those changes (new lookup)', () => {
        connectionSubscription.dispose();
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        environment.commitUpdate(storeProxy => {
          const edge = storeProxy.get(edgeID);
          invariant(edge, 'Expected edge to exist');
          const node = edge.getLinkedRecord('node');
          invariant(node, 'Expected node to exist');
          const message = node.getLinkedRecord('message');
          invariant(message, 'Expected message to exist');
          message.setValue('Comment 1 changed!', 'text');
        });
        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges.length).toBe(3);
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1 changed!'}, // existing data changed
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x', // insert is rebased
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x', // insert is rebased
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(2); // update + rebased insert
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        subscription.unsubscribe();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        const revertSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(revertSnapshot.edges.length).toBe(2);
        expect(revertSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1 changed!'}, // edit preserved
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // insert reverted
        ]);
        expect(revertSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // insert reverted
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1); // fetch
      });

      it('rebases optimistic inserts on fetch, and reverts w/o losing those changes', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const paginationOperation = createOperationDescriptor(paginationQuery, {
          id: '<feedbackid>',
          count: 2,
          cursor: 'cursor-2',
        });
        environment.execute({operation: paginationOperation}).subscribe({});
        const paginationPayload = {
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: {
                edges: [
                  {
                    cursor: 'cursor-3',
                    node: {
                      __typename: 'Comment',
                      id: 'node-3',
                      message: {text: 'Comment 3'},
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor-3',
                  hasNextPage: true,
                  hasPreviousPage: null,
                  startCursor: 'cursor-3',
                },
              },
            },
          },
        };
        dataSource.next(paginationPayload);
        jest.runAllTimers();
        expect(connectionCallback).toBeCalledTimes(1);
        const changeSnapshot = connectionCallback.mock.calls[0][0];
        expect(changeSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-3', // pagination result added
            node: {
              id: 'node-3',
              message: {text: 'Comment 3'},
              __fragmentOwner: paginationOperation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-3',
            },
          },
          {
            cursor: 'cursor-x', // insert is rebased
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(changeSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(2); // fetch + rebased insert
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        subscription.unsubscribe();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const revertSnapshot = connectionCallback.mock.calls[0][0];
        expect(revertSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-3', // fetch preserved
            node: {
              id: 'node-3',
              message: {text: 'Comment 3'},
              __fragmentOwner: paginationOperation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-3',
            },
          },
          // insert reverted
        ]);
        expect(revertSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-3', // insert reverted, fetch preserved
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('rebases optimistic inserts on node deletions, and reverts w/o losing those changes', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const edgeID =
          'client:<feedbackid>:comments(first:2,orderby:"date"):edges:0';
        environment.commitUpdate(storeProxy => {
          const edge = storeProxy.get(edgeID);
          invariant(edge, 'Expected edge to exist');
          const node = edge.getLinkedRecord('node');
          invariant(node, 'Expected node to exist');
          storeProxy.delete(node.getDataID());
        });
        expect(connectionCallback).toBeCalledTimes(1);
        const changeSnapshot = connectionCallback.mock.calls[0][0];
        expect(changeSnapshot.edges).toEqual([
          // edge removed bc node deleted
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x', // insert is rebased
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(changeSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x', // insert is rebased
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(2); // update + rebased insert
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        subscription.unsubscribe();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const revertSnapshot = connectionCallback.mock.calls[0][0];
        expect(revertSnapshot.edges).toEqual([
          // node deletion (and edge removal) preserved
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          // insert reverted
        ]);
        expect(revertSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-2', // insert reverted, fetch preserved
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(0);
      });

      it('applies additional optimistic edits to inserted edges', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        environment.applyUpdate({
          storeUpdater: storeProxy => {
            const node = storeProxy.get('node-x');
            invariant(node, 'Expected `node` to exist');
            const message = node.getLinkedRecord('message');
            invariant(message, 'Expected `node.message` to exist');
            message.setValue('Comment x message updated!', 'text');
          },
        });
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x',
            node: {
              id: 'node-x',
              message: {text: 'Comment x message updated!'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('reverts additional optimistic edits to inserted edges', () => {
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            const node = storeProxy.get('node-x');
            invariant(node, 'Expected `node` to exist');
            const message = node.getLinkedRecord('message');
            invariant(message, 'Expected `node.message` to exist');
            message.setValue('Comment x message updated!', 'text');
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        expect(connectionCallback).toBeCalledTimes(1);
        const nextSnapshot = connectionCallback.mock.calls[0][0];
        expect(nextSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x',
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(nextSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(1);
      });

      it('reverts additional optimistic edits to inserted edges (new lookup)', () => {
        connectionSubscription.dispose();
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        const disposable = environment.applyUpdate({
          storeUpdater: storeProxy => {
            const node = storeProxy.get('node-x');
            invariant(node, 'Expected `node` to exist');
            const message = node.getLinkedRecord('message');
            invariant(message, 'Expected `node.message` to exist');
            message.setValue('Comment x message updated!', 'text');
          },
        });
        connectionCallback.mockClear();
        connectionResolver.reduce.mockClear();

        disposable.dispose();
        expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
        const latestSnapshot = environment
          .getStore()
          .lookupConnection_UNSTABLE(
            (snapshot.data: $FlowFixMe).comments.__connection,
          ).state;
        expect(latestSnapshot.edges.length).toBe(3);
        expect(latestSnapshot.edges).toEqual([
          {
            cursor: 'cursor-1',
            node: {
              id: 'node-1',
              message: {text: 'Comment 1'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-1',
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              id: 'node-2',
              message: {text: 'Comment 2'},
              __fragmentOwner: operation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-2',
            },
          },
          {
            cursor: 'cursor-x',
            node: {
              id: 'node-x',
              message: {text: 'Comment x'},
              __fragmentOwner: mutation.request,
              __fragments: {CommentFragment: {}},
              __id: 'node-x',
            },
          },
        ]);
        expect(latestSnapshot.pageInfo).toEqual({
          endCursor: 'cursor-x',
          hasNextPage: true,
          hasPrevPage: null,
          startCursor: 'cursor-1',
        });
        expect(connectionResolver.reduce).toBeCalledTimes(2); // fetch + insert
      });
    });
  });
});
