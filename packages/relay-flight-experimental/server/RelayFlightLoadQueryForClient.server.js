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
import type {PreloadableConcreteRequest} from 'react-relay/relay-hooks/EntryPointTypes.flow';
import type {OperationType} from 'relay-runtime';

import * as ReactFlightDOMRelayServerIntegration from 'ReactFlightDOMRelayServerIntegration';
import {executeClientOperation} from 'RelayFlightOperationMap.server';

import invariant from 'invariant';

export default function loadQueryForClient<TQuery: OperationType>(
  query: PreloadableConcreteRequest<TQuery>,
  variables: TQuery['variables'],
): ClientQuery<TQuery> {
  const {id} = query.params;
  invariant(
    id != null,
    'loadQueryForClient(): All queries must have a persisted id',
  );
  const moduleId = `${query.params.name}.graphql`;
  ReactFlightDOMRelayServerIntegration.addModuleID_UNSAFE(moduleId);
  executeClientOperation(moduleId, query.params, variables);
  return {
    id,
    variables,
  };
}
