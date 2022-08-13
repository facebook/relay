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

import type {RequestParameters, Variables} from 'relay-runtime';

import invariant from 'invariant';
import {getRequestIdentifier} from 'relay-runtime';

export type RelayFlightParentOperationDescriptor = {
  operationId: string,
  operationKind: 'mutation' | 'query' | 'subscription',
  operationName: string,
  operationVariables: Variables,
};

let parentOperationDescriptor: ?RelayFlightParentOperationDescriptor = null;

export function getParentOperationRequestIdentifier(): string {
  invariant(
    parentOperationDescriptor != null,
    'RelayFlight: Expected the parent operation to have been defined.',
  );
  const {operationVariables} = parentOperationDescriptor;
  const requestParameters = getParentOperationRequestParamters();
  return getRequestIdentifier(requestParameters, operationVariables);
}

export function getParentOperationRequestParamters(): RequestParameters {
  invariant(
    parentOperationDescriptor != null,
    'RelayFlight: Expected the parent operation to have been defined.',
  );
  const {operationId, operationKind, operationName} = parentOperationDescriptor;
  const requestParameters: RequestParameters = {
    id: operationId,
    text: null,
    name: operationName,
    operationKind,
    metadata: {},
  };
  return requestParameters;
}

export function getParentOperationVariables(): Variables {
  invariant(
    parentOperationDescriptor?.operationVariables != null,
    'RelayFlight: Expected the parent operation variables to have been defined.',
  );
  return parentOperationDescriptor.operationVariables;
}

export function setParentOperationDescriptor(
  _parentOperationDescriptor: RelayFlightParentOperationDescriptor,
): void {
  parentOperationDescriptor = _parentOperationDescriptor;
}
