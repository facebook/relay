/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

import type RelayGarbageCollector from 'RelayGarbageCollector';
import type {ChangeSubscription, DataID} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
import type {StoreReaderData} from 'RelayTypes';

const readRelayQueryData = require('readRelayQueryData');
const recycleNodesInto = require('recycleNodesInto');
const warning = require('warning');

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
  _fragment: RelayQuery.Fragment;
  _resolver: ?(
    GraphQLStorePluralQueryResolver |
    GraphQLStoreSingleQueryResolver
  );
  _storeData: RelayStoreData;

  constructor(
    storeData: RelayStoreData,
    fragment: RelayQuery.Fragment,
    callback: Function
  ) {
    this.dispose();
    this._callback = callback;
    this._fragment = fragment;
    this._resolver = null;
    this._storeData = storeData;
  }

  /**
   * disposes the resolver's internal state such that future `resolve()` results
   * will not be `===` to previous results, and unsubscribes any subscriptions.
   */
  dispose(): void {
    if (this._resolver) {
      this._resolver.dispose();
    }
  }

  resolve(
    fragment: RelayQuery.Fragment,
    dataIDs: DataID | Array<DataID>
  ): ?(StoreReaderData | Array<?StoreReaderData>) {
    // Warn but don't crash if resolved with the wrong fragment.
    if (this._fragment.getConcreteFragmentID() !==
      fragment.getConcreteFragmentID()
    ) {
      warning(
        false,
        'GraphQLStoreQueryResolver: Expected `resolve` to be called with the ' +
        'same concrete fragment as the constructor. The resolver was created ' +
        'with fragment `%s` but resolved with fragment `%s`.',
        this._fragment.getDebugName(),
        fragment.getDebugName()
      );
    }
    // Rather than crash on mismatched plurality of fragment/ids just warn
    // and resolve as if the fragment's pluarity matched the format of the ids.
    // Note that the inverse - attempt to resolve based on fragment plurarity -
    // doesn't work because there's no way convert plural ids to singular w/o
    // losing data.
    if (Array.isArray(dataIDs)) {
      // Fragment should be plural if data is pluaral.
      warning(
        fragment.isPlural(),
        'GraphQLStoreQueryResolver: Expected id/fragment plurality to be ' +
        'consistent: got plural ids for singular fragment `%s`.',
        fragment.getDebugName()
      );
      let resolver = this._resolver;
      if (resolver instanceof GraphQLStoreSingleQueryResolver) {
        resolver.dispose();
        resolver = null;
      }
      if (!resolver) {
        resolver = new GraphQLStorePluralQueryResolver(
          this._storeData,
          this._callback
        );
      }
      this._resolver = resolver;
      return resolver.resolve(fragment, dataIDs);
    } else {
      // Fragment should be singular if data is singular.
      warning(
        !fragment.isPlural(),
        'GraphQLStoreQueryResolver: Expected id/fragment plurality to be ' +
        'consistent: got a singular id for plural fragment `%s`.',
        fragment.getDebugName()
      );
      let resolver = this._resolver;
      if (resolver instanceof GraphQLStorePluralQueryResolver) {
        resolver.dispose();
        resolver = null;
      }
      if (!resolver) {
        resolver = new GraphQLStoreSingleQueryResolver(
          this._storeData,
          this._callback
        );
      }
      this._resolver = resolver;
      return resolver.resolve(fragment, dataIDs);
    }
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
    this.dispose();
    this._callback = callback;
    this._storeData = storeData;
  }

  dispose(): void {
    if (this._resolvers) {
      this._resolvers.forEach(resolver => resolver.dispose());
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
  resolve(
    fragment: RelayQuery.Fragment,
    nextIDs: Array<DataID>
  ): Array<?StoreReaderData> {
    const prevResults = this._results;
    let nextResults;

    const prevLength = prevResults.length;
    const nextLength = nextIDs.length;
    const resolvers = this._resolvers;

    // Ensure that we have exactly `nextLength` resolvers.
    while (resolvers.length < nextLength) {
      resolvers.push(
        new GraphQLStoreSingleQueryResolver(this._storeData, this._callback)
      );
    }
    while (resolvers.length > nextLength) {
      resolvers.pop().dispose();
    }

    // Allocate `nextResults` if and only if results have changed.
    if (prevLength !== nextLength) {
      nextResults = [];
    }
    for (let ii = 0; ii < nextLength; ii++) {
      const nextResult = resolvers[ii].resolve(fragment, nextIDs[ii]);
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
    this.dispose();
    this._callback = callback;
    this._garbageCollector = storeData.getGarbageCollector();
    this._storeData = storeData;
    this._subscribedIDs = {};
  }

  dispose(): void {
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
   */
  resolve(
    nextFragment: RelayQuery.Fragment,
    nextID: DataID
  ): ?StoreReaderData {
    const prevFragment = this._fragment;
    const prevID = this._resultID;
    let nextResult;
    const prevResult = this._result;
    let subscribedIDs;

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
        const changeEmitter = this._storeData.getChangeEmitter();
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
    const {data, dataIDs} = readRelayQueryData(this._storeData, fragment, dataID);
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

      // Note: the same canonical ID may appear in both removed and added: in
      // that case, it would have been:
      // - previous step: canonical ID ref count was incremented
      // - current step: canonical ID is incremented *and* decremented
      // Note that the net ref count change is +1.
      Object.keys(nextDataIDs).forEach(id => {
        id = rangeData.getCanonicalClientID(id);
        garbageCollector.incrementReferenceCount(id);
      });
      Object.keys(prevDataIDs).forEach(id => {
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
