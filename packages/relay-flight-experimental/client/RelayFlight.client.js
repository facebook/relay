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

import type {ClientQuery} from 'RelayFlight.hybrid';
import type {GraphQLTaggedNode, OperationType} from 'relay-runtime';

import RelayFlightServerComponentRenderer from 'RelayFlightServerComponentRenderer.client';

import {useDebugValue} from 'react';
import useLazyLoadQueryNode from 'react-relay/relay-hooks/useLazyLoadQueryNode';
import useMemoOperationDescriptor from 'react-relay/relay-hooks/useMemoOperationDescriptor';
import useRelayEnvironment from 'react-relay/relay-hooks/useRelayEnvironment';
import useStaticFragmentNodeWarning from 'react-relay/relay-hooks/useStaticFragmentNodeWarning';
import {__internal} from 'relay-runtime';
import unrecoverableViolation from 'unrecoverableViolation';

const {fetchQuery} = __internal;

export type {ClientQuery};

export function useQueryFromServer<TQuery: OperationType>(
  query: GraphQLTaggedNode,
  result: ClientQuery<TQuery>,
): TQuery['response'] {
  const environment = useRelayEnvironment();
  const operation = useMemoOperationDescriptor(query, result.variables);
  useStaticFragmentNodeWarning(
    operation.fragment.node,
    'first argument of useQueryFromServer()',
  );
  if (operation.request.node.params.id !== result.id) {
    throw unrecoverableViolation(
      `useQueryFromServer(): Mismatched version for query '${operation.request.node.params.name}'`,
      'relay',
    );
  }
  const data = useLazyLoadQueryNode({
    componentDisplayName: 'useQueryFromServer()',
    fetchKey: null,
    fetchPolicy: 'store-only',
    fetchObservable: fetchQuery(environment, operation),
    query: operation,
    renderPolicy: null,
  });
  if (__DEV__) {
    useDebugValue({query: operation.request.node.params.name, data});
  }
  return data;
}

export * from 'RelayFlight.hybrid';
export {RelayFlightServerComponentRenderer as ServerComponentRenderer};
