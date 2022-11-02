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

import {
  initialize_INTERNAL_DO_NOT_USE,
  loadQueryForClient,
} from 'RelayFlight.server';
import * as OperationMap from 'RelayFlightOperationMap.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';

import {getRequest, graphql} from 'relay-runtime';

initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

beforeEach(() => {
  OperationMap.clear();
});

const NodeQuery = getRequest(graphql`
  query RelayFlightLoadQueryForClientTestNodeQuery($id: ID!) {
    node(id: $id) {
      ... on User {
        name
      }
    }
  }
`);

test('should return a query descriptor and queue the query for loading', () => {
  const query = loadQueryForClient((NodeQuery: $FlowFixMe), {id: '4'});
  expect(query).toEqual({
    id: NodeQuery.params.id,
    variables: {id: '4'},
  });

  const pending = OperationMap.getPendingClientOperations();
  expect(pending).toEqual([
    {
      id: NodeQuery.params.id,
      module: {__dr: 'RelayFlightLoadQueryForClientTestNodeQuery.graphql'},
      variables: {id: '4'},
    },
  ]);
});

test('deduplicates queries', () => {
  loadQueryForClient((NodeQuery: $FlowFixMe), {id: '4'});
  // call twice
  loadQueryForClient((NodeQuery: $FlowFixMe), {id: '4'});

  const pending = OperationMap.getPendingClientOperations();
  expect(pending).toEqual([
    {
      id: NodeQuery.params.id,
      module: {__dr: 'RelayFlightLoadQueryForClientTestNodeQuery.graphql'},
      variables: {id: '4'},
    },
  ]);
});

test('does not refetch already fetched queries', () => {
  loadQueryForClient((NodeQuery: $FlowFixMe), {id: '4'});
  OperationMap.getPendingClientOperations();
  loadQueryForClient((NodeQuery: $FlowFixMe), {id: '4'});

  const pending = OperationMap.getPendingClientOperations();
  expect(pending).toEqual([]);
});
