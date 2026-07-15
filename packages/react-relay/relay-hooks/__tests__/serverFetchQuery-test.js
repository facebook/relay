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

import type {FetchFunction, Query} from 'relay-runtime';

const serverFetchQuery = require('../rsc/serverFetchQuery');
const {Environment, Network, RecordSource, Store} = require('relay-runtime');

function createTestQuery(
  name: string,
  fields: Array<string>,
): Query<{...}, {id: string, name: string}> {
  const selections = fields.map(f => ({
    alias: null,
    args: null,
    kind: 'ScalarField',
    name: f,
    storageKey: null,
  }));

  // $FlowFixMe[incompatible-type] test fixture doesn't need full ConcreteRequest shape
  return {
    fragment: {
      argumentDefinitions: [],
      kind: 'Fragment',
      metadata: null,
      name,
      selections,
      type: 'Query',
      abstractKey: null,
    },
    kind: 'Request',
    operation: {
      argumentDefinitions: [],
      kind: 'Operation',
      name,
      selections,
    },
    params: {
      cacheID: `${name}-cache-id`,
      id: `${name}-persisted-id`,
      metadata: {},
      name,
      operationKind: 'query',
      text: null,
    },
  };
}

let mockFetchFn: FetchFunction;
let environment: Environment;

beforeEach(() => {
  mockFetchFn = jest.fn(() =>
    Promise.resolve({
      data: {id: 'user-1', name: 'Alice'},
    }),
  );
  environment = new Environment({
    network: Network.create(mockFetchFn),
    store: new Store(new RecordSource()),
    isServer: true,
  });
});

test('returns query data from the network response', async () => {
  const query = createTestQuery('FetchQuery', ['id', 'name']);
  const result = await serverFetchQuery(environment, query, {});

  expect(result).toEqual({id: 'user-1', name: 'Alice'});
});

test('populates the store so subsequent reads can access the data', async () => {
  const query = createTestQuery('StoreQuery', ['id', 'name']);

  await serverFetchQuery(environment, query, {});

  const {createOperationDescriptor, getRequest} = require('relay-runtime');
  const request = getRequest(query);
  const operation = createOperationDescriptor(request, {});
  const snapshot = environment.lookup(operation.fragment);

  expect(snapshot.data).toEqual({id: 'user-1', name: 'Alice'});
});

test('rejects when the network fetch fails', async () => {
  mockFetchFn = jest.fn(() => Promise.reject(new Error('Network error')));
  environment = new Environment({
    network: Network.create(mockFetchFn),
    store: new Store(new RecordSource()),
    isServer: true,
  });

  const query = createTestQuery('ErrorQuery', ['id']);
  await expect(serverFetchQuery(environment, query, {})).rejects.toThrow(
    'Network error',
  );
});
