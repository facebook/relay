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

import type {ClientQuery, RelayFlightImpl} from 'RelayFlight.hybrid';
import type {PreloadableConcreteRequest} from 'react-relay/relay-hooks/EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
  VariablesOf,
} from 'relay-runtime';

import invariant from 'invariant';
import useFragment from 'react-relay/relay-hooks/useFragment';
import useLazyLoadQuery from 'react-relay/relay-hooks/useLazyLoadQuery';
import {readInlineData} from 'relay-runtime';

function useReadQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: {
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
): TQuery['response'] {
  /* $FlowFixMe[incompatible-call] useLazyLoadQueries now uses type information
   * from the query */
  return useLazyLoadQuery(gqlQuery, variables, {
    fetchPolicy: 'store-only',
    UNSTABLE_renderPolicy: options?.UNSTABLE_renderPolicy,
  });
}

function loadFragmentForClient<TFragmentRef>(
  fragmentRef: TFragmentRef,
): TFragmentRef {
  return fragmentRef;
}

function loadQueryForClient<TQuery: OperationType>(
  query: PreloadableConcreteRequest<TQuery>,
  variables: TQuery['variables'],
): ClientQuery<TQuery> {
  const {id} = query.params;
  invariant(
    id != null,
    'loadQueryForClient(): All queries must have a persisted id',
  );
  return {
    id,
    variables,
  };
}

export default ({
  loadFragmentForClient,
  loadQueryForClient,
  useFragment: (useFragment: $FlowFixMe),
  useReadQuery,
  readInlineData,
}: RelayFlightImpl);
