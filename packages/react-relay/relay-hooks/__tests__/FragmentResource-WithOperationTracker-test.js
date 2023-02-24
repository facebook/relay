/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {LogEvent} from 'relay-runtime/store/RelayStoreTypes';

const {createFragmentResource} = require('../FragmentResource');
const invariant = require('invariant');
const {
  createOperationDescriptor,
  createReaderSelector,
  graphql,
} = require('relay-runtime');
const RelayOperationTracker = require('relay-runtime/store/RelayOperationTracker');
const {createMockEnvironment} = require('relay-test-utils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('FragmentResource with Operation Tracker and Missing Data', () => {
  const componentName = 'TestComponent';
  let environment;
  let NodeQuery;
  let ViewerFriendsQuery;
  let FriendsPaginationQuery;
  let UserFragment;
  let PlainUserNameRenderer_name;
  let PlainUserNameRenderer_name$normalization;
  let FragmentResource;
  let operationLoader;
  let operationTracker;
  let viewerOperation;
  let nodeOperation;
  let logger;

  beforeEach(() => {
    operationLoader = {
      load: jest.fn(),
      get: jest.fn(),
    };
    operationTracker = new RelayOperationTracker();
    logger = jest.fn<[LogEvent], void>();
    environment = createMockEnvironment({
      operationTracker,
      operationLoader,
      log: logger,
    });
    NodeQuery = graphql`
      query FragmentResourceWithOperationTrackerTestNodeQuery($id: ID!) {
        node(id: $id) {
          ...FragmentResourceWithOperationTrackerTestUserFragment
        }
      }
    `;
    ViewerFriendsQuery = graphql`
      query FragmentResourceWithOperationTrackerTestViewerFriendsQuery {
        viewer {
          actor {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...FragmentResourceWithOperationTrackerTestUserFragment
                }
              }
            }
          }
        }
      }
    `;
    FriendsPaginationQuery = graphql`
      query FragmentResourceWithOperationTrackerTestFriendsPaginationQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on User {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...FragmentResourceWithOperationTrackerTestUserFragment
                }
              }
            }
          }
        }
      }
    `;
    PlainUserNameRenderer_name = graphql`
      fragment FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;
    graphql`
      fragment FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        markdown
        data {
          markup
        }
      }
    `;
    PlainUserNameRenderer_name$normalization = require('./__generated__/FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql');
    UserFragment = graphql`
      fragment FragmentResourceWithOperationTrackerTestUserFragment on User {
        id
        name
        nameRenderer @match {
          ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name
            @module(name: "PlainUserNameRenderer.react")
          ...FragmentResourceWithOperationTrackerTestMarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
        plainNameRenderer: nameRenderer
          @match(
            key: "FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer"
          ) {
          ...FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name
            @module(name: "PlainUserNameRenderer.react")
        }
      }
    `;

    FragmentResource = createFragmentResource(environment);
    viewerOperation = createOperationDescriptor(ViewerFriendsQuery, {});
    nodeOperation = createOperationDescriptor(NodeQuery, {
      id: 'user-id-1',
    });
    environment.execute({operation: viewerOperation}).subscribe({});
    environment.subscribe(
      environment.lookup(viewerOperation.fragment),
      jest.fn(),
    );

    environment.mock.resolve(viewerOperation, {
      data: {
        viewer: {
          actor: {
            id: 'viewer-id',
            __typename: 'User',
            friends: {
              pageInfo: {
                hasNextPage: true,
                hasPrevPage: false,
                startCursor: 'cursor-1',
                endCursor: 'cursor-1',
              },
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    id: 'user-id-1',
                    name: 'Alice',
                    __typename: 'User',
                    nameRenderer: null,
                    plainNameRenderer: null,
                  },
                },
              ],
            },
          },
        },
      },
    });

    // We need to subscribe to a fragment in order for OperationTracker
    // to be able to notify owners if they are affected by any pending operation
    environment.subscribe(
      environment.lookup(
        createReaderSelector(
          UserFragment,
          'user-id-1',
          viewerOperation.request.variables,
          viewerOperation.request,
        ),
      ),
      jest.fn(),
    );
  });

  it('should throw and cache promise for pending operation affecting fragment owner', () => {
    environment.execute({operation: nodeOperation}).subscribe({});
    operationLoader.load.mockImplementation(() =>
      Promise.resolve(PlainUserNameRenderer_name$normalization),
    );
    environment.mock.nextValue(nodeOperation, {
      data: {
        node: {
          __typename: 'User',
          id: 'user-id-1',
          name: 'Alice',
          nameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_FragmentResourceWithOperationTrackerTestUserFragment:
              'PlainUserNameRenderer.react',
            __module_operation_FragmentResourceWithOperationTrackerTestUserFragment:
              'FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              id: 'plain-test-data-id-1',
              text: 'Data Text',
            },
          },
          plainNameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
              'PlainUserNameRenderer.react',
            __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
              'FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              id: 'plain-test-data-id-1',
              text: 'Data Text',
            },
          },
        },
      },
    });
    expect(operationLoader.load).toBeCalledTimes(2);

    // Calling `complete` here will just mark network request as completed, but
    // we still need to process follow-ups with normalization ASTs by resolving
    // the operation loader promise
    environment.mock.complete(nodeOperation);

    const fragmentRef = {
      __id: 'client:user-id-1:nameRenderer(supported:["PlainUserNameRenderer"])',
      __fragments: {
        FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name: {},
      },
      __fragmentOwner: viewerOperation.request,
    };

    let thrown = null;
    try {
      FragmentResource.read(
        PlainUserNameRenderer_name,
        fragmentRef,
        componentName,
      );
    } catch (promise) {
      expect(promise).toBeInstanceOf(Promise);
      thrown = promise;
    }
    expect(thrown).not.toBe(null);

    // Try reading fragment a second time while affecting operation is pending
    let cached = null;
    try {
      FragmentResource.read(
        PlainUserNameRenderer_name,
        fragmentRef,
        componentName,
      );
    } catch (promise) {
      expect(promise).toBeInstanceOf(Promise);
      cached = promise;
    }
    // Assert that promise from first read was cached
    expect(cached).toBe(thrown);

    // Assert that we logged a 'pendingoperation.found' event.
    const pendingOperationFoundEvents = logger.mock.calls
      .map(([event]) => event)
      .filter(event => event.name === 'pendingoperation.found');

    expect(pendingOperationFoundEvents.length).toBe(1);
    const event = pendingOperationFoundEvents[0];
    invariant(event.name === 'pendingoperation.found');
    expect(event.fragment.name).toBe(
      'FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name',
    );
    expect(event.fragmentOwner.node.operation.name).toBe(
      viewerOperation.request.node.operation.name,
    );
    expect(
      event.pendingOperations.map(owner => owner.node.operation.name),
    ).toEqual(['FragmentResourceWithOperationTrackerTestNodeQuery']);
  });

  it('should read the data from the store once operation fully completed', () => {
    environment.execute({operation: nodeOperation}).subscribe({});
    operationLoader.load.mockImplementation(() =>
      Promise.resolve(PlainUserNameRenderer_name$normalization),
    );
    environment.mock.nextValue(nodeOperation, {
      data: {
        node: {
          __typename: 'User',
          id: 'user-id-1',
          name: 'Alice',
          nameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_FragmentResourceWithOperationTrackerTestUserFragment:
              'PlainUserNameRenderer.react',
            __module_operation_FragmentResourceWithOperationTrackerTestUserFragment:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              id: 'plain-test-data-id-1',
              text: 'Data Text',
            },
          },
          plainNameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
              'PlainUserNameRenderer.react',
            __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              id: 'plain-test-data-id-1',
              text: 'Data Text',
            },
          },
        },
      },
    });
    expect(operationLoader.load).toBeCalledTimes(2);
    environment.mock.complete(nodeOperation);
    // To make sure promise is resolved
    jest.runAllTimers();
    const snapshot = FragmentResource.read(
      PlainUserNameRenderer_name,
      {
        __id: 'client:user-id-1:nameRenderer(supported:["PlainUserNameRenderer"])',
        __fragments: {
          FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name:
            {},
        },
        __fragmentOwner: viewerOperation.request,
      },
      componentName,
    );
    expect(snapshot.data).toEqual({
      data: {
        text: 'Data Text',
      },
      plaintext: 'Plaintext',
    });
  });

  it('should suspend on pagination query and then read the data', () => {
    const paginationOperation = createOperationDescriptor(
      FriendsPaginationQuery,
      {
        id: 'viewer-id',
      },
    );
    environment.execute({operation: paginationOperation}).subscribe({});
    operationLoader.load.mockImplementation(() =>
      Promise.resolve(PlainUserNameRenderer_name$normalization),
    );
    environment.mock.nextValue(paginationOperation, {
      data: {
        node: {
          __typename: 'User',
          id: 'viewer-id',
          friends: {
            pageInfo: {
              hasNextPage: true,
              hasPrevPage: false,
              startCursor: 'cursor-2',
              endCursor: 'cursor-2',
            },
            edges: [
              {
                cursor: 'cursor-2',
                node: {
                  __typename: 'User',
                  id: 'user-id-2',
                  name: 'Bob',
                  nameRenderer: {
                    __typename: 'PlainUserNameRenderer',
                    __module_component_FragmentResourceWithOperationTrackerTestUserFragment:
                      'PlainUserNameRenderer.react',
                    __module_operation_FragmentResourceWithOperationTrackerTestUserFragment:
                      'PlainUserNameRenderer_name$normalization.graphql',
                    plaintext: 'Plaintext 2',
                    data: {
                      id: 'plain-test-data-id-2',

                      text: 'Data Text 2',
                    },
                  },
                  plainNameRenderer: {
                    __typename: 'PlainUserNameRenderer',
                    __module_component_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
                      'PlainUserNameRenderer.react',
                    __module_operation_FragmentResourceWithOperationTrackerTestUserFragment_plainNameRenderer:
                      'PlainUserNameRenderer_name$normalization.graphql',
                    plaintext: 'Plaintext 2',
                    data: {
                      id: 'plain-test-data-id-2',
                      text: 'Data Text 2',
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });
    expect(operationLoader.load).toBeCalledTimes(2);
    const fragmentRef = {
      __id: 'client:user-id-2:nameRenderer(supported:["PlainUserNameRenderer"])',
      __fragments: {
        FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name: {},
      },
      __fragmentOwner: viewerOperation.request,
    };
    let promiseThrown = false;
    try {
      FragmentResource.read(
        PlainUserNameRenderer_name,
        fragmentRef,
        componentName,
      );
    } catch (promise) {
      expect(promise).toBeInstanceOf(Promise);
      promiseThrown = true;
    }
    expect(promiseThrown).toBe(true);

    // Complete the request
    environment.mock.complete(paginationOperation);
    // This should resolve promises
    jest.runAllTimers();

    const snapshot = FragmentResource.read(
      PlainUserNameRenderer_name,
      fragmentRef,
      componentName,
    );
    expect(snapshot.data).toEqual({
      data: {
        text: 'Data Text 2',
      },
      plaintext: 'Plaintext 2',
    });
  });
});
