/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DataID } from '../util/RelayRuntimeTypes';

export function generateClientID(id: DataID, storageKey: string, index?: number): DataID;

export function isClientID(id: DataID): boolean;

export function generateUniqueClientID(): DataID;
