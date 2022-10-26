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

import type {
  OperationDescriptor,
  OperationType,
  RequestParameters,
} from 'relay-runtime';

import * as RelayFlightStore from 'RelayFlightStore.server';

import err from 'err';
import invariant from 'invariant';
import stableStringify from 'stableStringify';

export opaque type OperationKey = string;

type Data = {[string]: mixed, ...};

type Thenable = {
  then: (resolve: () => void, reject: () => void) => void,
};

type MapRecord =
  | $ReadOnly<{
      status: 'pending',
      operation: OperationDescriptor,
      resolvers: Array<() => void>,
      thenable: Thenable,
    }>
  | $ReadOnly<{
      status: 'available',
      operation: OperationDescriptor,
      ...
    }>;

type ClientMapRecord = {
  fetched: boolean,
  +id: string,
  +moduleId: string,
  +variables: {...},
};

const operationMap: Map<OperationKey, MapRecord> = new Map();
const clientOperationMap: Map<OperationKey, ClientMapRecord> = new Map();

export function getOperationKey(operation: OperationDescriptor): OperationKey {
  return operation.request.identifier;
}

export function setOperationResult(
  operationKey: OperationKey,
  data: Data,
): void {
  const mapRecord = operationMap.get(operationKey);
  if (mapRecord == null) {
    throw err(
      `Unexpected results for operation key "${operationKey}".
      Please make sure to send an "init" event before sending "continuation"`,
    );
  }
  const operation = mapRecord.operation;
  operationMap.set(operationKey, {
    status: 'available',
    operation,
  });
  RelayFlightStore.publishData(operation, data);
  if (mapRecord.status === 'pending') {
    mapRecord.resolvers.forEach(fn => fn());
  }
}

export function getPendingOperations(): $ReadOnlyArray<OperationDescriptor> {
  const operations: Array<OperationDescriptor> = [];
  for (const record of operationMap.values()) {
    if (record.status === 'pending') {
      operations.push(record.operation);
    }
  }
  return operations;
}

export function isAvailable(operation: OperationDescriptor): boolean {
  const operationKey = getOperationKey(operation);
  const record = operationMap.get(operationKey);
  if (record != null) {
    return record.status === 'available';
  }
  return false;
}

export function executeOperation(operation: OperationDescriptor): void {
  const operationKey = getOperationKey(operation);
  const record = operationMap.get(operationKey);
  if (record == null) {
    const resolvers = [];
    const thenable = {
      then: (resolve: () => void, _reject: () => void) => {
        if (typeof resolve === 'function') {
          resolvers.push(resolve);
        }
      },
    };
    operationMap.set(operationKey, {
      status: 'pending',
      operation,
      resolvers,
      thenable,
    });
    throw thenable;
  } else if (record.status === 'pending') {
    throw record.thenable;
  }
}

export function setPendingOperation(operation: OperationDescriptor): void {
  const operationKey = getOperationKey(operation);
  const record = operationMap.get(operationKey);
  if (record != null) {
    return;
  }
  const resolvers = [];
  const thenable = {
    then: (resolve: () => void, _reject: () => void) => {
      if (typeof resolve === 'function') {
        resolvers.push(resolve);
      }
    },
  };
  operationMap.set(operationKey, {
    status: 'pending',
    operation,
    resolvers,
    thenable,
  });
}

export function clear(): void {
  operationMap.clear();
  clientOperationMap.clear();
}

export function executeClientOperation<TQuery: OperationType>(
  moduleId: string,
  params: RequestParameters,
  variables: TQuery['variables'],
): void {
  const {id} = params;
  invariant(id != null, 'executeClientOperation(): Expected a persisted query');
  const key = stableStringify({
    id,
    variables,
  });
  if (!clientOperationMap.has(key)) {
    clientOperationMap.set(key, {
      fetched: false,
      id,
      moduleId,
      variables,
    });
  }
}

export function getPendingClientOperations(): $ReadOnlyArray<{
  id: string,
  module: {__dr: string},
  variables: {...},
}> {
  const operations = [];
  for (const record of clientOperationMap.values()) {
    if (!record.fetched) {
      operations.push({
        id: record.id,
        module: {__dr: record.moduleId},
        variables: record.variables,
      });
      // remember that the operation was fetched so that we don't fetch again
      record.fetched = true;
    }
  }
  return operations;
}
