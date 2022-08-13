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

import type {RelayFlightUseQueryTestViewerQuery} from 'RelayFlightUseQueryTestViewerQuery.graphql';

import {initialize_INTERNAL_DO_NOT_USE, useQuery} from 'RelayFlight.server';
import * as OperationMap from 'RelayFlightOperationMap.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';

import {createOperationDescriptor, getRequest, graphql} from 'relay-runtime';

initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

beforeEach(() => {
  OperationMap.clear();
});

const ViewerQuery = getRequest(graphql`
  query RelayFlightUseQueryTestViewerQuery {
    viewer {
      actor {
        name
      }
    }
  }
`);

test('throw a thenable when data is missing and resolve it when data is available', () => {
  let thenable = null;
  try {
    useQuery<RelayFlightUseQueryTestViewerQuery>(ViewerQuery, {});
  } catch (thrownObject) {
    thenable = thrownObject;
  }
  expect(thenable).toEqual(
    expect.objectContaining({
      then: expect.any(Function),
    }),
  );

  const pendingQueries = OperationMap.getPendingOperations();
  expect(pendingQueries).toHaveLength(1);
  expect(pendingQueries[0].request.node).toBe(ViewerQuery);
  if (thenable == null || typeof thenable !== 'object') {
    return;
  }
  let resolved = false;
  // not a real promise! if only lint were type-aware...
  thenable.then(() => {
    resolved = true;
  });
  expect(resolved).toBe(false);
  const operationKey = OperationMap.getOperationKey(pendingQueries[0]);
  OperationMap.setOperationResult(operationKey, {});
  expect(resolved).toBe(true);
});

test('should return data from the cache', () => {
  let thenable = null;
  try {
    useQuery<RelayFlightUseQueryTestViewerQuery>(ViewerQuery, {});
  } catch (thrownObject) {
    thenable = thrownObject;
  }
  expect(thenable).not.toBe(null);

  const operation = createOperationDescriptor(ViewerQuery, {});
  const operationKey = OperationMap.getOperationKey(operation);
  OperationMap.setOperationResult(operationKey, {
    viewer: {
      actor: {
        __typename: 'User',
        name: 'Alice',
      },
    },
  });
  const data = useQuery<RelayFlightUseQueryTestViewerQuery>(ViewerQuery, {});
  expect(data.viewer?.actor?.name).toBe('Alice');
});
