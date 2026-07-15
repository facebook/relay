/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DataID } from '../util/RelayRuntimeTypes';
import { RecordState } from './RelayRecordState';
import {MutableRecordSource, Record, RecordMap} from './RelayStoreTypes';

export class RelayRecordSource implements MutableRecordSource {
    constructor(records?: RecordMap);

    static create(records?: RecordMap): MutableRecordSource;
    get<T extends object = Record<string, unknown>>(dataID: DataID): Record<T> | null | undefined;
    getRecordIDs(): DataID[];
    getStatus(dataID: DataID): RecordState;
    has(dataID: DataID): boolean;
    size(): number;
    toJSON(): { [key: string]: Record };
    clear(): void;
    delete(dataID: DataID): void;
    remove(dataID: DataID): void;
    set(dataID: DataID, record: Record): void;
}
