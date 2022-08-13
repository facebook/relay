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

import type {PreloadableConcreteRequest} from 'react-relay/relay-hooks/EntryPointTypes.flow';
import typeof UseFragmentType from 'react-relay/relay-hooks/useFragment';
import type {
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
  VariablesOf,
} from 'relay-runtime';
import typeof {readInlineData as ReadInlineDataType} from 'relay-runtime';

import err from 'err';
import warning from 'warning';

export type ClientQuery<TQuery: OperationType> = {
  id: string,
  variables: TQuery['variables'],
};

export interface RelayFlightImpl {
  loadFragmentForClient<TFragmentRef>(fragmentRef: TFragmentRef): TFragmentRef;

  loadQueryForClient<TQuery: OperationType>(
    query: PreloadableConcreteRequest<TQuery>,
    variables: TQuery['variables'],
  ): ClientQuery<TQuery>;

  useFragment: UseFragmentType;

  useReadQuery<TQuery: OperationType>(
    gqlQuery: GraphQLTaggedNode,
    variables: VariablesOf<TQuery>,
    options?: {
      UNSTABLE_renderPolicy?: RenderPolicy,
    },
  ): TQuery['response'];

  readInlineData: ReadInlineDataType;
}

// Injected API implementation
let _implementation: RelayFlightImpl | null = null;

// Internal-use only

export function isServer_INTERNAL_DO_NOT_USE(): boolean {
  return global.__flight_execution_mode_DO_NOT_USE === 'flight';
}

/**
 * @private
 */
function assertInitialized(): RelayFlightImpl {
  // Special handling for when RelayFlight.hybrid is evaluated before
  // we are able to initilize it in CometRelayEnvironmentFactory.
  if (!isServer_INTERNAL_DO_NOT_USE() && _implementation == null) {
    const RelayFlightClientImpl = require('RelayFlightClientImpl.client');
    _implementation = RelayFlightClientImpl;
  }

  if (_implementation == null) {
    throw err(
      'Expected RelayFlight::initialize_INTERNAL_DO_NOT_USE() to be called before using other APIs.',
    );
  }
  return _implementation;
}

/**
 * Inject an implementation of the API - this allows the same API to be
 * used on the client or server.
 */
export function initialize_INTERNAL_DO_NOT_USE(impl: RelayFlightImpl): void {
  if (_implementation != null) {
    warning(
      _implementation === impl, // ok to initialize the same impl twice
      'RelayFlight::initialize_INTERNAL_DO_NOT_USE(): Already ' +
        'initialized, this module may not be initialized again.',
    );
    return;
  }
  _implementation = impl;
}

// Hybrid APIs

// $FlowFixMe[escaped-generic]
export const readInlineData: ReadInlineDataType = (...args) => {
  const impl = assertInitialized();
  // We supress this Flow error here to avoid re-declaring all the types for
  // this function again in this file
  // $FlowFixMe
  return impl.readInlineData(...args);
};

/**
 * Reads the data for a fragment from the Relay store, and subscribes
 * to any updates to that data
 */
// $FlowFixMe[escaped-generic]
export const useFragment: UseFragmentType = (...args) => {
  const impl = assertInitialized();
  // $FlowFixMe[incompatible-type] discovered when improving types of useFragment
  // $FlowFixMe[escaped-generic] discovered when improving types of useFragment
  return impl.useFragment(...args);
};

/**
 * Reads the data for a query from the Relay store, and subscribes
 * to any updates to that data
 */
export function useReadQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: {
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
): TQuery['response'] {
  const impl = assertInitialized();
  return impl.useReadQuery(gqlQuery, variables, options);
}

export function loadFragmentForClient<TFragmentRef>(
  fragmentRef: TFragmentRef,
): TFragmentRef {
  const impl = assertInitialized();
  return impl.loadFragmentForClient(fragmentRef);
}

export function loadQueryForClient<TQuery: OperationType>(
  query: PreloadableConcreteRequest<TQuery>,
  variables: TQuery['variables'],
): ClientQuery<TQuery> {
  const impl = assertInitialized();
  return impl.loadQueryForClient(query, variables);
}

export {graphql} from 'relay-runtime/query/GraphQLTag';
