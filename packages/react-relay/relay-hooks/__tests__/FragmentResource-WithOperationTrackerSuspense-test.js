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

const {getFragment} = require('../../../relay-runtime');
const {createFragmentResource} = require('../legacy/FragmentResource');
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

describe('FragmentResource with Operation Tracker and Suspense behavior', () => {
  const componentName = 'TestComponent';
  let environment;
  let UserFragment;
  let FragmentResource;
  let operationTracker;
  let nodeOperation;
  let logger;
  let UserQuery;
  let ViewerFriendsQuery;
  let viewerOperation;
  let UsersFragment;
  let UsersQuery;
  let pluralOperation;

  const pluralVariables = {ids: ['user-id-1']};

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE = true;
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = true;
    operationTracker = new RelayOperationTracker();
    logger = jest.fn<[LogEvent], void>();
    environment = createMockEnvironment({
      operationTracker,
      log: logger,
    });

    UserFragment = graphql`
      fragment FragmentResourceWithOperationTrackerSuspenseTestFragment on User {
        id
        name
      }
    `;
    UserQuery = graphql`
      query FragmentResourceWithOperationTrackerSuspenseTestQuery($id: ID!) {
        node(id: $id) {
          __typename
          ...FragmentResourceWithOperationTrackerSuspenseTestFragment
            @dangerously_unaliased_fixme
        }
      }
    `;

    UsersFragment = graphql`
      fragment FragmentResourceWithOperationTrackerSuspenseTest2Fragment on User
      @relay(plural: true) {
        id
        name
      }
    `;

    UsersQuery = graphql`
      query FragmentResourceWithOperationTrackerSuspenseTest2Query(
        $ids: [ID!]!
      ) {
        nodes(ids: $ids) {
          __typename
          ...FragmentResourceWithOperationTrackerSuspenseTest2Fragment
        }
      }
    `;

    ViewerFriendsQuery = graphql`
      query FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery {
        viewer {
          actor {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...FragmentResourceWithOperationTrackerSuspenseTestFragment
                }
              }
            }
          }
        }
      }
    `;
    FragmentResource = createFragmentResource(environment);
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
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE = false;
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = false;
  });

  it('should throw promise for pending operation affecting fragment owner', async () => {
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
        FragmentResourceWithOperationTrackerSuspenseTestFragment: {},
      },
      __fragmentOwner: nodeOperation.request,
    };

    let result = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentName,
    );
    FragmentResource.subscribe(result, jest.fn());

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

    let thrown = null;
    try {
      FragmentResource.read(
        getFragment(UserFragment),
        fragmentRef,
        componentName,
      );
    } catch (p) {
      expect(p).toBeInstanceOf(Promise);
      thrown = p;
    }
    expect(thrown).not.toBe(null);

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
    await expect(thrown).resolves.not.toThrow();

    result = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentName,
    );
    expect(result.data).toEqual({
      id: 'user-id-1',
      name: 'Alice222',
    });
  });

  it('should throw promise for plural fragment', async () => {
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

    const fragment2Ref = {
      __id: 'user-id-1',
      __fragments: {
        FragmentResourceWithOperationTrackerSuspenseTest2Fragment: {},
      },
      __fragmentOwner: pluralOperation.request,
    };

    let result = FragmentResource.read(
      getFragment(UsersFragment),
      [fragment2Ref],
      componentName,
    );
    FragmentResource.subscribe(result, jest.fn());

    const fragmentRef = {
      __id: 'user-id-1',
      __fragments: {
        FragmentResourceWithOperationTrackerSuspenseTestFragment: {},
      },
      __fragmentOwner: nodeOperation.request,
    };

    const result2 = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentName,
    );
    FragmentResource.subscribe(result2, jest.fn());

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

    let thrown = null;
    try {
      FragmentResource.read(
        getFragment(UsersFragment),
        [fragment2Ref],
        componentName,
      );
    } catch (p) {
      expect(p).toBeInstanceOf(Promise);
      thrown = p;
    }
    expect(thrown).not.toBe(null);

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
    await expect(thrown).resolves.not.toThrow();

    result = FragmentResource.read(
      getFragment(UsersFragment),
      [fragment2Ref],
      componentName,
    );
    expect(result.data).toEqual([
      {
        id: 'user-id-1',
        name: 'Alice222',
      },
    ]);
  });
});
