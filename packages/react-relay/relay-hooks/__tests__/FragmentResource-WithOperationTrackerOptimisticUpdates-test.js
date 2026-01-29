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

describe('FragmentResource with Operation Tracker for optimistic updates behavior', () => {
  const componentName = 'TestComponent';
  let environment;
  let UserFragment;
  let FragmentResource;
  let operationTracker;
  let nodeOperation;
  let nodeOperation2;
  let logger;
  let UserQuery;
  let ViewerFriendsQuery;
  let viewerOperation;

  beforeEach(() => {
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = true;
    operationTracker = new RelayOperationTracker();
    logger = jest.fn<[LogEvent], void>();
    environment = createMockEnvironment({
      operationTracker,
      log: logger,
    });

    UserFragment = graphql`
      fragment FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment on User {
        id
        name
      }
    `;
    UserQuery = graphql`
      query FragmentResourceWithOperationTrackerOptimisticUpdatesTestQuery(
        $id: ID!
      ) {
        node(id: $id) {
          __typename
          ...FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment
            @dangerously_unaliased_fixme
        }
      }
    `;

    ViewerFriendsQuery = graphql`
      query FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery {
        viewer {
          actor {
            friends(first: 1) @connection(key: "Viewer_friends") {
              edges {
                node {
                  ...FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment
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
    nodeOperation2 = createOperationDescriptor(UserQuery, {
      id: 'user-id-2',
    });
    viewerOperation = createOperationDescriptor(ViewerFriendsQuery, {});
    environment.execute({operation: viewerOperation}).subscribe({});
    environment.execute({operation: nodeOperation}).subscribe({});
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
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES = false;
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
        FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment: {},
      },
      __fragmentOwner: nodeOperation.request,
    };

    const result = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentName,
    );
    FragmentResource.subscribe(result, jest.fn());

    // Execute the nodeOperation as a mutation and set the record as undefined in optimistic updater
    environment
      .executeMutation({
        operation: nodeOperation,
        optimisticUpdater: store => {
          const record = store.get('user-id-1');
          record?.setValue(undefined, 'name');
        },
      })
      .subscribe({});

    // Check the pending opeartion for both the node and viewer query
    const pendingOperationsForViewerOperation =
      operationTracker.getPendingOperationsAffectingOwner(
        viewerOperation.request,
      )?.promise;
    expect(pendingOperationsForViewerOperation).not.toBe(null);

    const pendingOperationsForNodeOperation =
      operationTracker.getPendingOperationsAffectingOwner(
        nodeOperation.request,
      )?.promise;
    expect(pendingOperationsForNodeOperation).not.toBe(null);
  });

  it('when an unrelated operation resolves while an optimistic response is currently applied', () => {
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
              endCursor: 'cursor-2',
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

    const fragmentRef = {
      __id: 'user-id-1',
      __fragments: {
        FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment: {},
      },
      __fragmentOwner: nodeOperation.request,
    };
    const fragmentRef2 = {
      __id: 'user-id-2',
      __fragments: {
        FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment: {},
      },
      __fragmentOwner: nodeOperation2.request,
    };

    const result = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef,
      componentName,
    );
    FragmentResource.subscribe(result, jest.fn());
    const result2 = FragmentResource.read(
      getFragment(UserFragment),
      fragmentRef2,
      componentName,
    );
    FragmentResource.subscribe(result2, jest.fn());

    // Execute the nodeOperation as a mutation and set the record as undefined in optimistic updater
    environment
      .executeMutation({
        operation: nodeOperation,
        optimisticUpdater: store => {
          const record = store.get('user-id-1');
          record?.setValue(undefined, 'name');
        },
      })
      .subscribe({});
    environment
      .executeMutation({
        operation: nodeOperation2,
        optimisticUpdater: store => {
          const record = store.get('user-id-2');
          record?.setValue(undefined, 'name');
        },
      })
      .subscribe({});

    const pendingOperationsForNodeOperation =
      operationTracker.getPendingOperationsAffectingOwner(
        nodeOperation.request,
      );
    expect(pendingOperationsForNodeOperation?.pendingOperations.length).toBe(1);
    const pendingOperationsForNodeOperation2 =
      operationTracker.getPendingOperationsAffectingOwner(
        nodeOperation2.request,
      );
    expect(pendingOperationsForNodeOperation2?.pendingOperations.length).toBe(
      1,
    );
  });
});
