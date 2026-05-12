/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ReaderPaginationMetadata } from './ReaderNode';
import { Variables } from './RelayRuntimeTypes';

export type Direction = 'forward' | 'backward';

export default function getPaginationVariables(
    direction: Direction,
    count: number,
    cursor: string | null | undefined,
    baseVariables: Variables,
    extraVariables: Variables,
    paginationMetadata: ReaderPaginationMetadata,
): { [key: string]: any };
