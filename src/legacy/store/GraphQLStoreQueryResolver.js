/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreQueryResolver
 * @typechecks
 * @flow
 */

'use strict';

import type {ChangeSubscription} from 'GraphQLStoreChangeEmitter';
import type GraphQLFragmentPointer from 'GraphQLFragmentPointer';
import type RelayGarbageCollector from 'RelayGarbageCollector';
import type {DataID} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
import type {StoreReaderData} from 'RelayTypes';

const filterExclusiveKeys = require('filterExclusiveKeys');
const readRelayQueryData = require('readRelayQueryData');
const recycleNodesInto = require('recycleNodesInto');

type DataIDSet = {[dataID: DataID]: any};

/**
 * @internal
 *
 * Resolves data from fragment pointers.
 *
 * The supplied `callback` will be invoked whenever data returned by the last
 * invocation to `resolve` has changed.
 */
class GraphQLStoreQueryResolver {
  _callback: Function;
  _fragmentPointer: GraphQLFragmentPointer;
  _resolver: ?(
    GraphQLStorePluralQueryResolver |
    GraphQLStoreSingleQueryResolver
  );
  _storeData: RelayStoreData;

  constructor(
    storeData: RelayStoreData,
    fragmentPointer: GraphQLFragmentPointer,
    callback: Function
  ) {
    this.reset();
    this._callback = callback;
    this._fragmentPointer = fragmentPointer;
    this._resolver = null;
    this._storeData = storeData;
  }

  /**
   * Resets the resolver's internal state such that future `resolve()` results
   * will not be `===` to previous results, and unsubscribes any subscriptions.
   */
  reset(): void {
    if (this._resolver) {
      this._resolver.reset();
    }
  }

  resolve(
    fragmentPointer: GraphQLFragmentPointer
  ): ?(StoreReaderData | Array<?StoreReaderData>) {
    var resolver = this._resolver;
    if (!resolver) {
      resolver = this._fragmentPointer.getFragment().isPlural() ?
        new GraphQLStorePluralQueryResolver(this._storeData, this._callback) :
        new GraphQLStoreSingleQueryResolver(this._storeData, this._callback);
      this._resolver = resolver;
    }
    return resolver.resolve(fragmentPointer);
  }
}

/**
 * Resolves plural fragments.
 */
class GraphQLStorePluralQueryResolver {
  _callback: Function;
  _resolvers: Array<GraphQLStoreSingleQueryResolver>;
  _results: Array<?StoreReaderData>;
  _storeData: RelayStoreData;

  constructor(storeData: RelayStoreData, callback: Function) {
    this.reset();
    this._callback = callback;
    this._storeData = storeData;
  }

  reset(): void {
    if (this._resolvers) {
      this._resolvers.forEach(resolver => resolver.reset());
    }
    this._resolvers = [];
    this._results = [];
  }

  /**
   * Resolves a plural fragment pointer into an array of records.
   *
   * If the data, order, and number of resolved records has not changed since
   * the last call to `resolve`, the same array will be returned. Otherwise, a
   * new array will be returned.
   */
  resolve(fragmentPointer: GraphQLFragmentPointer): Array<?StoreReaderData> {
    var prevResults = this._results;
    var nextResults;

    var nextIDs = fragmentPointer.getDataIDs();
    var prevLength = prevResults.length;
    var nextLength = nextIDs.length;
    var resolvers = this._resolvers;

    // Ensure that we have exactly `nextLength` resolvers.
    while (resolvers.length < nextLength) {
      resolvers.push(
        new GraphQLStoreSingleQueryResolver(this._storeData, this._callback)
      );
    }
    while (resolvers.length > nextLength) {
      resolvers.pop().reset();
    }

    // Allocate `nextResults` if and only if results have changed.
    if (prevLength !== nextLength) {
      nextResults = [];
    }
    for (var ii = 0; ii < nextLength; ii++) {
      var nextResult = resolvers[ii].resolve(fragmentPointer, nextIDs[ii]);
      if (nextResults || ii >= prevLength || nextResult !== prevResults[ii]) {
        nextResults = nextResults || prevResults.slice(0, ii);
        nextResults.push(nextResult);
      }
    }

    if (nextResults) {
      this._results = nextResults;
    }
    return this._results;
  }
}

/**
 * Resolves non-plural fragments.
 */
class GraphQLStoreSingleQueryResolver {
  _callback: Function;
  _fragment: ?RelayQuery.Fragment;
  _garbageCollector: ?RelayGarbageCollector;
  _hasDataChanged: boolean;
  _result: ?StoreReaderData;
  _resultID: ?DataID;
  _storeData: RelayStoreData;
  _subscribedIDs: DataIDSet;
  _subscription: ?ChangeSubscription;

  constructor(storeData: RelayStoreData, callback: Function) {
    this.reset();
    this._callback = callback;
    this._garbageCollector = storeData.getGarbageCollector();
    this._storeData = storeData;
    this._subscribedIDs = {};
  }

  reset(): void {
    if (this._subscription) {
      this._subscription.remove();
    }
    this._hasDataChanged = false;
    this._fragment = null;
    this._result = null;
    this._resultID = null;
    this._subscription = null;
    this._updateGarbageCollectorSubscriptionCount({});
    this._subscribedIDs = {};
  }

  /**
   * Resolves data for a single fragment pointer.
   *
   * NOTE: `nextPluralID` should only be passed by the plural query resolver.
   */
  resolve(
    fragmentPointer: GraphQLFragmentPointer,
    nextPluralID?: ?DataID
  ): ?StoreReaderData {
    var nextFragment = fragmentPointer.getFragment();
    var prevFragment = this._fragment;

    var nextID = nextPluralID || fragmentPointer.getDataID();
    var prevID = this._resultID;
    var nextResult;
    var prevResult = this._result;
    var subscribedIDs;

    if (
      prevFragment != null &&
      prevID != null &&
      this._getCanonicalID(prevID) === this._getCanonicalID(nextID)
    ) {
      if (
        prevID !== nextID ||
        this._hasDataChanged ||
        !nextFragment.isEquivalent(prevFragment)
      ) {
        // same canonical ID,
        // but the data, call(s), route, and/or variables have changed
        [nextResult, subscribedIDs] = this._resolveFragment(
          nextFragment,
          nextID
        );
        nextResult = recycleNodesInto(prevResult, nextResult);
      } else {
        // same id, route, variables, and data
        nextResult = prevResult;
      }
    } else {
      // Pointer has a different ID or is/was fake data.
      [nextResult, subscribedIDs] = this._resolveFragment(
        nextFragment,
        nextID
      );
    }

    // update subscriptions whenever results change
    if (prevResult !== nextResult) {
      if (this._subscription) {
        this._subscription.remove();
        this._subscription = null;
      }
      if (subscribedIDs) {
        // always subscribe to the root ID
        subscribedIDs[nextID] = true;
        var changeEmitter = this._storeData.getChangeEmitter();
        this._subscription = changeEmitter.addListenerForIDs(
          Object.keys(subscribedIDs),
          this._handleChange.bind(this)
        );
        this._updateGarbageCollectorSubscriptionCount(subscribedIDs);
        this._subscribedIDs = subscribedIDs;
      }
      this._resultID = nextID;
      this._result = nextResult;
    }

    this._hasDataChanged = false;
    this._fragment = nextFragment;

    return this._result;
  }

  /**
   * Ranges publish events for the entire range, not the specific view of that
   * range. For example, if "client:1" is a range, the event is on "client:1",
   * not "client:1_first(5)".
   */
  _getCanonicalID(id: DataID): DataID {
    return this._storeData.getRangeData().getCanonicalClientID(id);
  }

  _handleChange(): void {
    if (!this._hasDataChanged) {
      this._hasDataChanged = true;
      this._callback();
    }
  }

  _resolveFragment(
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ): [?StoreReaderData, DataIDSet] {
    var {data, dataIDs} = readRelayQueryData(this._storeData, fragment, dataID);
    return [data, dataIDs];
  }

  /**
   * Updates bookkeeping about the number of subscribers on each record.
   */
  _updateGarbageCollectorSubscriptionCount(
    nextDataIDs: {[dataID: DataID]: boolean},
  ): void {
    if (this._garbageCollector) {
      const garbageCollector = this._garbageCollector;
      const rangeData = this._storeData.getRangeData();

      const prevDataIDs = this._subscribedIDs;
      const [removed, added] = filterExclusiveKeys(prevDataIDs, nextDataIDs);

      // Note: the same canonical ID may appear in both removed and added: in
      // that case, it would have been:
      // - previous: canonical ID ref count is incremented
      // - current: canonical ID is incremented *and* decremented
      // In both cases the next ref count change is +1.
      added.forEach(id => {
        id = rangeData.getCanonicalClientID(id);
        garbageCollector.incrementReferenceCount(id);
      });
      removed.forEach(id => {
        id = rangeData.getCanonicalClientID(id);
        garbageCollector.decrementReferenceCount(id);
      });
    }
  }
}

RelayProfiler.instrumentMethods(GraphQLStoreQueryResolver.prototype, {
  resolve: 'GraphQLStoreQueryResolver.resolve',
});

module.exports = GraphQLStoreQueryResolver;
