/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

jest.mock('warning');
const {createFragmentResource} = require('../FragmentResource');
const {
  createOperationDescriptor,
  createReaderSelector,
} = require('relay-runtime');
const RelayOperationTracker = require('relay-runtime/store/RelayOperationTracker');
const {MockPayloadGenerator} = require('relay-test-utils');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');
const warning = require('warning');

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

  beforeEach(() => {
    operationLoader = {
      load: jest.fn(),
      get: jest.fn(),
    };
    operationTracker = new RelayOperationTracker();
    environment = createMockEnvironment({
      operationTracker,
      operationLoader,
    });
    const compiled = generateAndCompile(`
      query NodeQuery($id: ID!) @relay_test_operation {
        node(id: $id) {
          ...UserFragment
        }
      }

      query ViewerFriendsQuery @relay_test_operation {
        viewer {
          actor {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...UserFragment
                }
              }
            }
          }
        }
      }

      query FriendsPaginationQuery($id: ID!) @relay_test_operation {
        node(id: $id) {
          ... on User {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...UserFragment
                }
              }
            }
          }
        }
      }

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

      fragment UserFragment on User {
        id
        name
        nameRenderer @match {
          ...PlainUserNameRenderer_name @module(name: "PlainUserNameRenderer.react")
          ...MarkdownUserNameRenderer_name
            @module(name: "MarkdownUserNameRenderer.react")
        }
        plainNameRenderer: nameRenderer @match(key: "UserFragment_plainNameRenderer") {
          ...PlainUserNameRenderer_name @module(name: "PlainUserNameRenderer.react")
        }
      }
    `);
    ({
      NodeQuery,
      ViewerFriendsQuery,
      FriendsPaginationQuery,
      PlainUserNameRenderer_name,
      PlainUserNameRenderer_name$normalization,
      UserFragment,
    } = compiled);
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

    // This will add data to the store (but not for 3D)
    environment.mock.resolve(
      viewerOperation,
      // TODO: (alunyov) T43369419 [relay-testing] Make sure MockPayloadGenerator can generate data for @match
      MockPayloadGenerator.generate(viewerOperation, {
        Actor() {
          return {
            id: 'viewer-id',
          };
        },
        User(_, generateId) {
          return {
            id: 'user-id-1',
          };
        },
      }),
    );

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
    // $FlowFixMe
    warning.mockClear();
  });

  it('should warn if data is missing and it is not being fetched by owner or other operations', () => {
    // At this point the viewer query is resolved but, it does not have any 3D data
    // So it should throw a waring for missing data
    const snapshot = FragmentResource.read(
      PlainUserNameRenderer_name,
      {
        __id:
          'client:user-id-1:nameRenderer(supported:["PlainUserNameRenderer"])',
        __fragments: {
          PlainUserNameRenderer_name: {},
        },
        __fragmentOwner: viewerOperation.request,
      },
      componentName,
    );
    expect(snapshot.data).toEqual({
      data: undefined,
      plaintext: undefined,
    });
    expect(warning).toBeCalled();
    // $FlowFixMe
    expect(warning.mock.calls[0][0]).toBe(false);
    // $FlowFixMe
    expect(warning.mock.calls[0][1]).toMatch(/it has missing data/);
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
            __module_component_UserFragment: 'PlainUserNameRenderer.react',
            __module_operation_UserFragment:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              text: 'Data Text',
            },
          },
          plainNameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_UserFragment_plainNameRenderer:
              'PlainUserNameRenderer.react',
            __module_operation_UserFragment_plainNameRenderer:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
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
      __id:
        'client:user-id-1:nameRenderer(supported:["PlainUserNameRenderer"])',
      __fragments: {
        PlainUserNameRenderer_name: {},
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
            __module_component_UserFragment: 'PlainUserNameRenderer.react',
            __module_operation_UserFragment:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
              text: 'Data Text',
            },
          },
          plainNameRenderer: {
            __typename: 'PlainUserNameRenderer',
            __module_component_UserFragment_plainNameRenderer:
              'PlainUserNameRenderer.react',
            __module_operation_UserFragment_plainNameRenderer:
              'PlainUserNameRenderer_name$normalization.graphql',
            plaintext: 'Plaintext',
            data: {
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
    // $FlowFixMe
    warning.mockClear();
    const snapshot = FragmentResource.read(
      PlainUserNameRenderer_name,
      {
        __id:
          'client:user-id-1:nameRenderer(supported:["PlainUserNameRenderer"])',
        __fragments: {
          PlainUserNameRenderer_name: {},
        },
        __fragmentOwner: viewerOperation.request,
      },
      componentName,
    );
    expect(warning).not.toBeCalled();
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
            edges: [
              {
                node: {
                  __typename: 'User',
                  id: 'user-id-2',
                  name: 'Bob',
                  nameRenderer: {
                    __typename: 'PlainUserNameRenderer',
                    __module_component_UserFragment:
                      'PlainUserNameRenderer.react',
                    __module_operation_UserFragment:
                      'PlainUserNameRenderer_name$normalization.graphql',
                    plaintext: 'Plaintext 2',
                    data: {
                      text: 'Data Text 2',
                    },
                  },
                  plainNameRenderer: {
                    __typename: 'PlainUserNameRenderer',
                    __module_component_UserFragment_plainNameRenderer:
                      'PlainUserNameRenderer.react',
                    __module_operation_UserFragment_plainNameRenderer:
                      'PlainUserNameRenderer_name$normalization.graphql',
                    plaintext: 'Plaintext 2',
                    data: {
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
      __id:
        'client:user-id-2:nameRenderer(supported:["PlainUserNameRenderer"])',
      __fragments: {
        PlainUserNameRenderer_name: {},
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
