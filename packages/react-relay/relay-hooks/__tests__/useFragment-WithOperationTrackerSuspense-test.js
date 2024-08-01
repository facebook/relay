/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {LogEvent} from 'relay-runtime/store/RelayStoreTypes';

const ReactRelayContext = require('../../ReactRelayContext');
const useFragment = require('../useFragment');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  createOperationDescriptor,
  createReaderSelector,
  graphql,
} = require('relay-runtime');
const RelayOperationTracker = require('relay-runtime/store/RelayOperationTracker');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');
const {createMockEnvironment} = require('relay-test-utils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('useFragment with Operation Tracker and Suspense behavior', () => {
  let environment;
  let UserFragment;
  let operationTracker;
  let nodeOperation;
  let logger;
  let UserQuery;
  let ViewerFriendsQuery;
  let viewerOperation;
  let UsersFragment;
  let UsersQuery;
  let pluralOperation;
  let render;

  const pluralVariables = {ids: ['user-id-1']};

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = true;
    RelayFeatureFlags.ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE = true;
    operationTracker = new RelayOperationTracker();
    logger = jest.fn<[LogEvent], void>();
    environment = createMockEnvironment({
      operationTracker,
      log: logger,
    });

    UserFragment = graphql`
      fragment useFragmentWithOperationTrackerSuspenseTestFragment on User {
        id
        name
      }
    `;
    UserQuery = graphql`
      query useFragmentWithOperationTrackerSuspenseTestQuery($id: ID!) {
        node(id: $id) {
          __typename
          ...useFragmentWithOperationTrackerSuspenseTestFragment
        }
      }
    `;

    UsersFragment = graphql`
      fragment useFragmentWithOperationTrackerSuspenseTest2Fragment on User
      @relay(plural: true) {
        id
        name
      }
    `;

    UsersQuery = graphql`
      query useFragmentWithOperationTrackerSuspenseTest2Query($ids: [ID!]!) {
        nodes(ids: $ids) {
          __typename
          ...useFragmentWithOperationTrackerSuspenseTest2Fragment
        }
      }
    `;

    ViewerFriendsQuery = graphql`
      query useFragmentWithOperationTrackerSuspenseTestViewerFriendsQuery {
        viewer {
          actor {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...useFragmentWithOperationTrackerSuspenseTestFragment
                }
              }
            }
          }
        }
      }
    `;
    nodeOperation = createOperationDescriptor(UserQuery, {
      id: 'user-id-1',
    });
    viewerOperation = createOperationDescriptor(ViewerFriendsQuery, {});
    pluralOperation = createOperationDescriptor(UsersQuery, pluralVariables);

    environment.execute({operation: viewerOperation}).subscribe({});
    environment.execute({operation: nodeOperation}).subscribe({});
    environment.execute({operation: pluralOperation}).subscribe({});

    environment.subscribe(
      environment.lookup(viewerOperation.fragment),
      jest.fn(),
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
    environment.subscribe(
      environment.lookup(
        createReaderSelector(
          UsersFragment,
          'user-id-1',
          pluralOperation.request.variables,
          pluralOperation.request,
        ),
      ),
      jest.fn(),
    );
    environment.subscribe(
      environment.lookup(
        createReaderSelector(
          UserFragment,
          'user-id-1',
          nodeOperation.request.variables,
          nodeOperation.request,
        ),
      ),
      jest.fn(),
    );

    const ContextProvider = ({children}: {children: React.Node}) => {
      return (
        <ReactRelayContext.Provider value={{environment}}>
          {children}
        </ReactRelayContext.Provider>
      );
    };

    const Container = (props: {userRef: $FlowFixMe, ...}) => {
      const isPlural = Array.isArray(props.userRef);
      // $FlowFixMe[incompatible-call]
      const userData = useFragment(
        isPlural ? UsersFragment : UserFragment,
        props.userRef,
      );
      return Array.isArray(userData)
        ? userData.map(user => (
            <React.Fragment key={user.id}>{user.name}</React.Fragment>
          ))
        : userData.name;
    };

    render = function (props: $FlowFixMe) {
      let instance;
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          <React.Suspense fallback="Singular Fallback">
            <ContextProvider>
              <Container {...props} />
            </ContextProvider>
          </React.Suspense>,
        );
      });
      return instance;
    };
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = false;
    RelayFeatureFlags.ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE = false;
  });

  it('should throw promise for pending operation affecting fragment owner', () => {
    environment.commitPayload(viewerOperation, {
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
                },
              },
            ],
          },
        },
      },
    });

    const fragmentRef = {
      __id: 'user-id-1',
      __fragments: {
        useFragmentWithOperationTrackerSuspenseTestFragment: {},
      },
      __fragmentOwner: nodeOperation.request,
    };

    const renderer = render({userRef: fragmentRef});
    expect(renderer.toJSON()).toBe('Alice'); // should show the name

    ReactTestRenderer.act(() => {
      environment
        .executeMutation({
          operation: nodeOperation,
          optimisticUpdater: store => {
            const record = store.get('user-id-1');
            record?.setValue(undefined, 'name');
          },
        })
        .subscribe({});
      jest.runAllImmediates();
    });

    expect(renderer.toJSON()).toBe('Singular Fallback'); // Component is suspended now for optimistic update
    ReactTestRenderer.act(() => {
      environment.mock.nextValue(nodeOperation, {
        data: {
          node: {
            __typename: 'User',
            id: 'user-id-1',
            name: 'Alice222',
          },
        },
      });
      environment.mock.complete(nodeOperation.request.node);
    });

    expect(renderer.toJSON()).toBe('Alice222');
  });

  it('should throw promise for plural fragment', () => {
    environment.commitPayload(viewerOperation, {
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
                },
              },
              {
                cursor: 'cursor-2',
                node: {
                  id: 'user-id-2',
                  name: 'Bob',
                  __typename: 'User',
                },
              },
            ],
          },
        },
      },
    });

    const fragmentPluralRef = [
      {
        __id: 'user-id-1',
        __fragments: {
          useFragmentWithOperationTrackerSuspenseTest2Fragment: {},
        },
        __fragmentOwner: pluralOperation.request,
      },
      {
        __id: 'user-id-2',
        __fragments: {
          useFragmentWithOperationTrackerSuspenseTest2Fragment: {},
        },
        __fragmentOwner: pluralOperation.request,
      },
    ];

    const rendererPlural = render({userRef: fragmentPluralRef});
    expect(rendererPlural.toJSON()).toEqual(['Alice', 'Bob']);

    ReactTestRenderer.act(() => {
      // Execute the nodeOperation query with executeMutation and set the record as undefined in optimistic updater
      environment
        .executeMutation({
          operation: nodeOperation,
          optimisticUpdater: store => {
            const record = store.get('user-id-1');
            record?.setValue(undefined, 'name');
          },
        })
        .subscribe({});
      jest.runAllImmediates();
    });

    expect(rendererPlural.toJSON()).toEqual(['Singular Fallback']);

    ReactTestRenderer.act(() => {
      environment.mock.nextValue(nodeOperation, {
        data: {
          node: {
            __typename: 'User',
            id: 'user-id-1',
            name: 'Alice222',
          },
        },
      });
      environment.mock.complete(nodeOperation.request.node);
    });

    expect(rendererPlural.toJSON()).toEqual(['Alice222', 'Bob']);
  });
});
