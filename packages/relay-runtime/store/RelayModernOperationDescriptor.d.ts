/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ConcreteRequest } from '../util/RelayConcreteNode';
import {CacheConfig, DataID, Variables} from '../util/RelayRuntimeTypes';
import {OperationDescriptor, RequestDescriptor} from './RelayStoreTypes';
/**
 * Creates an instance of the `OperationDescriptor` type defined in
 * `RelayStoreTypes` given an operation and some variables. The input variables
 * are filtered to exclude variables that do not match defined arguments on the
 * operation, and default values are populated for null values.
 */
export function createOperationDescriptor(
    request: ConcreteRequest,
    variables: Variables,
    cacheConfig?: CacheConfig | null,
    dataID?: DataID,
): OperationDescriptor;

export function createRequestDescriptor(
    request: ConcreteRequest,
    variables: Variables,
    cacheConfig?: CacheConfig | null,
): RequestDescriptor;
