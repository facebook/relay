/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDebugger
 * @flow
 * @format
 */

'use strict';

const RelayRecordSourceInspector = require('RelayRecordSourceInspector');

import type {DataID} from 'RelayInternalTypes';
import type {RecordSummaryType} from 'RelayRecordSourceInspector';
import type {Environment, OperationSelector} from 'RelayStoreTypes';

type MatchType = 'idtype' | 'id' | 'type' | 'predicate';

class RelayDebugger {
  _envDebuggers: Map<string, EnvironmentDebugger>;
  _idCounter: number;
  _inspector: RelayRecordSourceInspector;

  constructor() {
    this._idCounter = 1;
    this._envDebuggers = new Map();
  }

  registerEnvironment(env: Environment): string {
    const idString = `RelayModernEnvironment${this._idCounter++}`;
    this._envDebuggers.set(idString, new EnvironmentDebugger(env, idString));
    return idString;
  }

  getEnvironmentDebugger(id: string): EnvironmentDebugger {
    const envDebugger = this._envDebuggers.get(id);
    if (!envDebugger) {
      throw new Error(`No registered environment: ${id}`);
    }

    return envDebugger;
  }

  getRegisteredEnvironmentIds(): Array<string> {
    return Array.from(this._envDebuggers.keys());
  }
}

type MutationEvent = {
  snapshotBefore: any,
  snapshotAfter: any,
  eventName: string,
  mutation: OperationSelector,
};

class EnvironmentDebugger {
  _environment: Environment;
  _id: string;
  _envIsDirty: boolean;
  _isRecordingMutationEvents: boolean;
  _recordedMutationEvents: Array<MutationEvent>;

  constructor(environment: Environment, id: string) {
    this._environment = environment;
    this._id = id;
    this._envIsDirty = false;
    this._monkeyPatchSource();

    this._recordedMutationEvents = [];
    this._isRecordingMutationEvents = false;
  }

  getEnvironment(): Environment {
    return this._environment;
  }

  getId(): string {
    return this._id;
  }

  getMatchingRecords(
    matchStr: string,
    matchType: MatchType,
  ): Array<RecordSummaryType> {
    const inspector = RelayRecordSourceInspector.getForEnvironment(
      this._environment,
    );

    function isMatching(record: RecordSummaryType): boolean {
      if (matchType === 'idtype') {
        return (
          record.id.includes(matchStr) ||
          (!!record.type && record.type.includes(matchStr))
        );
      }
      if (matchType === 'id') {
        return record.id.includes(matchStr);
      }
      if (matchType === 'type') {
        return !!record.type && record.type.includes(matchStr);
      }
      if (matchType === 'predicate') {
        const recordInspector = inspector.get(record.id);
        const fields = recordInspector && recordInspector.inspect();
        if (typeof fields === 'object' && fields !== null) {
          throw new Error('Not implemented');
        }
        return false;
      }
      throw new Error('Unknown match type: ' + matchType);
    }

    return inspector.getRecords().filter(isMatching);
  }

  getRecord(id: DataID) {
    const inspector = RelayRecordSourceInspector.getForEnvironment(
      this._environment,
    );
    const recordInspector = inspector.get(id);
    return recordInspector && recordInspector.inspect();
  }

  _monkeyPatchSource() {
    const source = (this._environment.getStore().getSource(): any);
    const originalSet = source.set;
    const originalRemove = source.remove;

    source.set = (...args) => {
      originalSet.apply(source, args);
      this.triggerDirty();
    };
    source.remove = (...args) => {
      originalRemove.apply(source, args);
      this.triggerDirty();
    };
  }

  triggerDirty() {
    this._envIsDirty = true;
  }

  isDirty() {
    return this._envIsDirty;
  }

  resetDirty() {
    this._envIsDirty = false;
  }

  startRecordingMutationEvents() {
    this._isRecordingMutationEvents = true;
    this._recordedMutationEvents = [];
  }

  stopRecordingMutationEvents() {
    this._isRecordingMutationEvents = false;
  }

  getRecordedMutationEvents(): Array<MutationEvent> {
    return this._recordedMutationEvents;
  }

  recordMutationEvent({
    eventName,
    seriesId,
    payload,
    mutation,
    fn,
  }: {
    eventName: string,
    seriesId: string,
    payload: any,
    mutation: OperationSelector,
    fn: () => void,
  }) {
    if (this._isRecordingMutationEvents) {
      const source = this._environment.getStore().getSource();
      function getSnapshot() {
        const snapshot = {};
        const ids = source.getRecordIDs();
        ids.forEach(id => {
          snapshot[id] = source.get(id);
        });
        return snapshot;
      }

      const snapshotBefore = getSnapshot();
      fn();
      const snapshotAfter = getSnapshot();

      const event = {
        eventName,
        seriesId,
        payload,
        snapshotBefore,
        snapshotAfter,
        mutation,
      };

      this._recordedMutationEvents.push(event);
    } else {
      fn();
    }
  }
}

module.exports = {
  RelayDebugger,
  EnvironmentDebugger,
};
