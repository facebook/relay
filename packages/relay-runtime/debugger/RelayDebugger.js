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

import type {RecordSummaryType} from 'RelayRecordSourceInspector';
import type {Environment} from 'RelayStoreTypes';

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
    this._envDebuggers.set(idString, new EnvironmentDebugger(env));
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

class EnvironmentDebugger {
  _environment: Environment;

  constructor(environment: Environment) {
    this._environment = environment;
  }

  getEnvironment(): Environment {
    return this._environment;
  }

  getMatchingRecords(
    matchStr: string,
    matchType: MatchType,
  ): Array<RecordSummaryType> {
    const inspector = RelayRecordSourceInspector.getForEnvironment(
      this._environment,
    );

    function isMatching(record: RecordSummaryType): boolean {
      if (matchType === 'id' || matchType === 'idtype') {
        return record.id.includes(matchStr);
      }
      if (matchType === 'type' || matchType === 'idtype') {
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
}

module.exports = RelayDebugger;
