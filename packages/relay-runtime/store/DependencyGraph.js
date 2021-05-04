/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {DataID} from '../util/RelayRuntimeTypes';

export type DependencyLink = $ReadOnly<{|
  upstreamDataID: DataID,
  downstreamDataID: DataID,
  downstreamFieldStorageKey: string,
|}>;

type DependencyUpdateInstruction =
  | {|+kind: 'unlink', +dataID: DataID, +storageKey: string|}
  | {|+kind: 'delete', +dataID: DataID|};

export interface DependencyGraph {
  getInstructionsForUpdatedIDs(
    updated: $ReadOnlySet<DataID>,
  ): Array<DependencyUpdateInstruction>;
}

// $FlowFixMe[unclear-type] - will always be empty
const emptySet: $ReadOnlySet<any> = new Set();

class MutableDependencyGraph implements DependencyGraph {
  _downward: Map<DataID, Set<DependencyUpdateInstruction>>;

  constructor() {
    this._downward = new Map();
  }

  _getDirectDownstreams(id: DataID): $ReadOnlySet<DependencyUpdateInstruction> {
    return this._downward.get(id) ?? emptySet;
  }

  _getDownstreamsOfIDs(
    ids: $ReadOnlySet<DataID>,
  ): Set<DependencyUpdateInstruction> {
    const links: Set<DependencyUpdateInstruction> = new Set();
    const visited: Set<DataID> = new Set();
    const toVisit: Array<DataID> = Array.from(ids);
    while (toVisit.length) {
      const upstreamDataID = toVisit.pop();
      visited.add(upstreamDataID);
      for (const downstreamInstruction of this._getDirectDownstreams(
        upstreamDataID,
      )) {
        links.add(downstreamInstruction);
        if (
          downstreamInstruction.kind === 'delete' &&
          !visited.has(downstreamInstruction.dataID)
        ) {
          toVisit.push(downstreamInstruction.dataID);
        }
      }
    }
    return links;
  }

  getInstructionsForUpdatedIDs(
    updated: $ReadOnlySet<DataID>,
  ): Array<DependencyUpdateInstruction> {
    return Array.from(this._getDownstreamsOfIDs(updated));
  }

  // TODO two graphs, one for deletion and one for unlinking,
  // so that sets actually make sense and we don't get duplicate entries.
  _addInstruction(upstreamDataID, instruction): void {
    let s = this._downward.get(upstreamDataID);
    if (s === undefined) {
      s = new Set();
      this._downward.set(upstreamDataID, s);
    }
    s.add(instruction);
  }

  /*
    Mark a dependency between various records.

    * dataIDOfRequestingRecord
       The record whose value depends on some other data. This can be either
       a normal record that has a resolver field, or, in the case of a resolver
       that uses another resolver, the outer resolver's value record.
    * dataIDWithResolverField
      The outermost record that has a resolver field on it. This will be the same as
      dataIDOfRequestingRecord except where a resolver uses anothe resolver.
    * resolverFieldStorageKey
      The field name of the resolver on the dataIDWithResolverField record.
    * resolverResultRecordDataID
      The record where the resolver result is being memoized.
    * seenRecords
      Other records that were accessed while computing the resolver.

    There are two distinct kinds of edges in the graph:
    1) An edge from a normal, user-visible record that has a resolver field
       to the record that stores that resolver's memoized value.
    2) An edge from a record that stores a resolver's memoized value to some
       other record: either that of another resolver's memoized value, or just
       any record that the resolver reads from. This type of edge also exists
       back to the record that has the resolver field on it, but in the opposite
       direction from the first edge type.
   */
  setDependency(
    dataIDOfRequestingRecord: DataID,
    dataIDWithResolverField: DataID,
    resolverFieldStorageKey: string,
    resolverResultRecordDataID: DataID,
    seenRecords: Set<DataID>,
  ): void {
    if (dataIDWithResolverField === dataIDOfRequestingRecord) {
      this._addInstruction(resolverResultRecordDataID, {
        kind: 'unlink',
        dataID: dataIDWithResolverField,
        storageKey: resolverFieldStorageKey,
      });
    } else {
      this._addInstruction(resolverResultRecordDataID, {
        kind: 'delete',
        dataID: dataIDOfRequestingRecord,
      });
    }
    this._addInstruction(dataIDWithResolverField, {
      kind: 'delete',
      dataID: resolverResultRecordDataID,
    });
    for (const seenRecordID of seenRecords) {
      this._addInstruction(seenRecordID, {
        kind: 'delete',
        dataID: resolverResultRecordDataID,
      });
    }
  }
}

module.exports = {
  MutableDependencyGraph,
};
