/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {OperationKey} from 'RelayFlightOperationMap.server';
import type {RelayFlightParentOperationDescriptor} from 'RelayFlightParentOperation.server';
import type {Variables} from 'relay-runtime';

import * as RelayFlight from 'RelayFlight.hybrid';
import * as RelayFlightOperationMap from 'RelayFlightOperationMap.server';
import * as RelayFlightParentOperation from 'RelayFlightParentOperation.server';
// TODO T74209602: Implement Flight support for all React element types
// Monkey-patch React to provide server-compatible versions of common helpers
import {
  patchReactCreateContext,
  patchReactCurrentDispatcher,
} from 'RelayFlightReactPolyfill.server';
import RelayFlightRendererTask from 'RelayFlightRendererTask.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';
import {lookup} from 'RelayFlightStore.server';

import configureRelayForWWW from 'configureRelayForWWW';
import err from 'err';
import * as React from 'react';
import {
  createOperationDescriptor,
  getFragment,
  getRefetchMetadata,
  getValueAtPath,
} from 'relay-runtime';

/**
 * The Input union represents inputs to transform functions:
 *
 * Init: The first call to a transform function, which may or may not complete
 * synchronously.
 *
 * Continuation: A continuation of a previous call, providing additional data
 * to unblock further computation. The transform must have previously resolved
 * to a Pending state.
 */
export type Input = Init | Continuation;

export type Init = $ReadOnly<{
  kind: 'init',
  name: string,
  args: mixed,
  fragmentModule: string,
  variables: Variables,
  parentOperation: RelayFlightParentOperationDescriptor,
}>;

export type Continuation = $ReadOnly<{
  kind: 'continuation',
  taskId: string,
  results: $ReadOnlyArray<
    $ReadOnly<{
      operationKey: OperationKey,
      data: string,
    }>,
  >,
}>;

/**
 * Result union represents the output of the TransformRunner.run(...) method:
 *
 * Complete - if the result of the transform is a complete value,
 * and we need to pass it back to the transforming consumer
 *
 * Error - something isn't right, runtime error
 *
 * Query - To complete the `run` transform needs more data,
 * this query is sent to the transforming consumer to properly handle the query
 * and return the results, so the runner can continue the execution.
 */
export type Result = Complete | Pending;

export type Complete = $ReadOnly<{
  kind: 'complete',
  value: $ReadOnly<{
    tree: mixed,
    modules: $ReadOnlyArray<string>,
    queries: $ReadOnlyArray<
      $ReadOnly<{
        id: string,
        module: {__dr: string},
        variables: mixed,
      }>,
    >,
    gkLogs: $ReadOnlyArray<{identifier: string, hash: string}>,
    ixPaths: $ReadOnlyArray<string>,
  }>,
}>;

export type Pending = $ReadOnly<{
  kind: 'pending',
  taskId: string,
  value: $ReadOnlyArray<
    $ReadOnly<{
      operationKey: OperationKey,
      id: string,
      variables: mixed,
    }>,
  >,
}>;

let nextTaskId = 0;
const pendingTasks = new Map();

// Inject the server implementation (note that this also occurs in RelayFlight.server)
// as early as possible to ensure that no consuming code can call methods w/o the
// environment being ready.
RelayFlight.initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

// Allows Hack to do a SPIN check to see if the client supports query preloading
// @ServerCallable
export function spinRevSupportsQueryPreloading() {}

// @ServerCallable
export function init(_module_ref_DO_NOT_USE: mixed) {
  // NOTE: ideally this would occur before any product code is loaded, since
  // product module factories may destructure imports and assign the overridden
  // property (createContext) to a local.
  patchReactCreateContext();

  // Ok to initialize anytime before running product logic
  configureRelayForWWW();
}

// @ServerCallable
export function run(payload: Input): string {
  let task;
  if (payload.kind === 'init') {
    const taskId = String(nextTaskId++);
    // eslint-disable-next-line no-useless-call
    const ServerComponent = require.call(null, payload.name);
    if (ServerComponent == null) {
      throw err(`Unknown Server Component '${payload.name}'`);
    }

    RelayFlightParentOperation.setParentOperationDescriptor(
      payload.parentOperation,
    );

    // The new convention for Server Components is that they define a
    // root @refetchable fragment to declare their data dependencies, which
    // should be enforced statically.

    // Here, we extract the query descriptor from the @refetchable fragment
    // metadata, which we will use to both read and write the query once we
    // get the data back from Hack.
    const rootFragmentNode = getFragment(
      // eslint-disable-next-line no-useless-call
      require.call(null, payload.fragmentModule),
    );
    const {fragmentRefPathInResponse, refetchableRequest} = getRefetchMetadata(
      rootFragmentNode,
      payload.name,
    );
    const rootOperationDescriptor = createOperationDescriptor(
      refetchableRequest,
      payload.variables,
    );

    // We create a task but without starting server rendering. Previously
    // Server components would use `useQuery`, which would suspend on the
    // specified query and set it as the pending operation. Now, we are
    // using a useFragment with a @refetchable fragment inside the SC, which
    // doesn't have the same logic for suspending on the @refetchable-generated
    // operation, so we encode this logic here: instead of rendering and
    // expecting the component to suspend and set the pending operation, we
    // avoid initially rendering all-together, and manually ser the pending
    // operation which we know we will need before we can start rendering
    // at all anyway.
    task = new RelayFlightRendererTask(taskId, () => {
      patchReactCurrentDispatcher();

      // At the point of rendering, we assume that the data for the @refetchable
      // fragment has already been written to the store, so we can read it here.
      const queryData = lookup(rootOperationDescriptor.fragment).data;
      const fragmentRef = getValueAtPath(queryData, fragmentRefPathInResponse);
      return <ServerComponent {...payload.args} fragmentRef={fragmentRef} />;
    });
    RelayFlightOperationMap.setPendingOperation(rootOperationDescriptor);
    pendingTasks.set(taskId, task);
  } else if (payload.kind === 'continuation') {
    task = pendingTasks.get(payload.taskId);
    if (task == null) {
      throw err(`Unknown task '${payload.taskId}`);
    }
    payload.results.forEach(result => {
      RelayFlightOperationMap.setOperationResult(
        result.operationKey,
        JSON.parse(result.data),
      );
    });
    task.render();
  } else {
    (payload: empty);
    throw err(`Unknown kind '${payload.kind}'`);
  }
  const result = task.poll();
  return JSON.stringify(result) ?? '';
}
