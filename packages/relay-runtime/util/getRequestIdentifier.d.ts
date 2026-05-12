/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RequestParameters } from './RelayConcreteNode';
import { Variables } from './RelayRuntimeTypes';

export type RequestIdentifier = string;

/**
 * Returns a stable identifier for the given pair of `RequestParameters` +
 * variables.
 */
export default function getRequestIdentifier(parameters: RequestParameters, variables: Variables): RequestIdentifier;
