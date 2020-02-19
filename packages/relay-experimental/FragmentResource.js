/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const LRUCache = require('./LRUCache');

const invariant = require('invariant');
const mapObject = require('mapObject');
const warning = require('warning');

const {
  __internal: {getPromiseForActiveRequest},
  getFragmentIdentifier,
  getSelector,
  isPromise,
  recycleNodesInto,
} = require('relay-runtime');

import type {Cache} from './LRUCache';
import type {
  Disposable,
  IEnvironment,
  ReaderFragment,
  RequestDescriptor,
  Snapshot,
} from 'relay-runtime';

export type FragmentResource = FragmentResourceImpl;

type FragmentResourceCache = Cache<Error | Promise<mixed> | FragmentResult>;

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}

type SingularOrPluralSnapshot = Snapshot | $ReadOnlyArray<Snapshot>;
opaque type FragmentResult: {data: mixed, ...} = {|
  cacheKey: string,
  data: mixed,
  snapshot: SingularOrPluralSnapshot | null,
|};

// TODO: Fix to not rely on LRU. If the number of active fragments exceeds this
// capacity, readSpec() will fail to find cached entries and break object
// identity even if data hasn't changed.
const CACHE_CAPACITY = 1000000;

function isMissingData(snapshot: SingularOrPluralSnapshot) {
  if (Array.isArray(snapshot)) {
    return snapshot.some(s => s.isMissingData);
  }
  return snapshot.isMissingData;
}

function getFragmentResult(
  cacheKey: string,
  snapshot: SingularOrPluralSnapshot,
): FragmentResult {
  if (Array.isArray(snapshot)) {
    return {cacheKey, snapshot, data: snapshot.map(s => s.data)};
  }
  return {cacheKey, snapshot, data: snapshot.data};
}

function getPromiseForPendingOperationAffectingOwner(
  environment: IEnvironment,
  request: RequestDescriptor,
): Promise<void> | null {
  return environment
    .getOperationTracker()
    .getPromiseForPendingOperationsAffectingOwner(request);
}

class FragmentResourceImpl {
  _environment: IEnvironment;
  _cache: FragmentResourceCache;

  constructor(environment: IEnvironment) {
    this._environment = environment;
    this._cache = LRUCache.create(CACHE_CAPACITY);
  }

  /**
   * This function should be called during a Component's render function,
   * to read the data for a fragment, or suspend if the fragment is being
   * fetched.
   */
  read(
    fragmentNode: ReaderFragment,
    fragmentRef: mixed,
    componentDisplayName: string,
    fragmentKey?: string,
  ): FragmentResult {
    return this.readWithIdentifier(
      fragmentNode,
      fragmentRef,
      getFragmentIdentifier(fragmentNode, fragmentRef),
      componentDisplayName,
      fragmentKey,
    );
  }

  /**
   * Like `read`, but with pre-computed fragmentIdentifier that should be
   * equal to `getFragmentIdentifier(fragmentNode, fragmentRef)` from the
   * arguments.
   */
  readWithIdentifier(
    fragmentNode: ReaderFragment,
    fragmentRef: mixed,
    fragmentIdentifier: string,
    componentDisplayName: string,
    fragmentKey?: ?string,
  ): FragmentResult {
    const environment = this._environment;

    // If fragmentRef is null or undefined, pass it directly through.
    // This is a convenience when consuming fragments via a HOC api, when the
    // prop corresponding to the fragment ref might be passed as null.
    if (fragmentRef == null) {
      return {cacheKey: fragmentIdentifier, data: null, snapshot: null};
    }

    // If fragmentRef is plural, ensure that it is an array.
    // If it's empty, return the empty array direclty before doing any more work.
    if (fragmentNode?.metadata?.plural === true) {
      invariant(
        Array.isArray(fragmentRef),
        'Relay: Expected fragment pointer%s for fragment `%s` to be ' +
          'an array, instead got `%s`. Remove `@relay(plural: true)` ' +
          'from fragment `%s` to allow the prop to be an object.',
        fragmentKey != null ? ` for key \`${fragmentKey}\`` : '',
        fragmentNode.name,
        typeof fragmentRef,
        fragmentNode.name,
      );
      if (fragmentRef.length === 0) {
        return {cacheKey: fragmentIdentifier, data: [], snapshot: []};
      }
    }

    // Now we actually attempt to read the fragment:

    // 1. Check if there's a cached value for this fragment
    const cachedValue = this._cache.get(fragmentIdentifier);
    if (cachedValue != null) {
      if (isPromise(cachedValue) || cachedValue instanceof Error) {
        throw cachedValue;
      }
      if (cachedValue.snapshot) {
        return cachedValue;
      }
    }

    // 2. If not, try reading the fragment from the Relay store.
    // If the snapshot has data, return it and save it in cache
    const fragmentSelector = getSelector(fragmentNode, fragmentRef);
    invariant(
      fragmentSelector != null,
      'Relay: Expected to receive an object where `...%s` was spread, ' +
        'but the fragment reference was not found`. This is most ' +
        'likely the result of:\n' +
        "- Forgetting to spread `%s` in `%s`'s parent's fragment.\n" +
        '- Conditionally fetching `%s` but unconditionally passing %s prop ' +
        'to `%s`. If the parent fragment only fetches the fragment conditionally ' +
        '- with e.g. `@include`, `@skip`, or inside a `... on SomeType { }` ' +
        'spread  - then the fragment reference will not exist. ' +
        'In this case, pass `null` if the conditions for evaluating the ' +
        'fragment are not met (e.g. if the `@include(if)` value is false.)',
      fragmentNode.name,
      fragmentNode.name,
      componentDisplayName,
      fragmentNode.name,
      fragmentKey == null ? 'a fragment reference' : `the \`${fragmentKey}\``,
      componentDisplayName,
    );
    const snapshot =
      fragmentSelector.kind === 'PluralReaderSelector'
        ? fragmentSelector.selectors.map(s => environment.lookup(s))
        : environment.lookup(fragmentSelector);
    const fragmentOwner =
      fragmentSelector.kind === 'PluralReaderSelector'
        ? fragmentSelector.selectors[0].owner
        : fragmentSelector.owner;
    const parentQueryName =
      fragmentOwner.node.params.name ?? 'Unknown Parent Query';

    if (!isMissingData(snapshot)) {
      const fragmentResult = getFragmentResult(fragmentIdentifier, snapshot);
      this._cache.set(fragmentIdentifier, fragmentResult);
      return fragmentResult;
    }

    // 3. If we don't have data in the store, check if a request is in
    // flight for the fragment's parent query, or for another operation
    // that may affect the parent's query data, such as a mutation
    // or subscription. If a promise exists, cache the promise and use it
    // to suspend.
    const networkPromise = this._getAndSavePromiseForFragmentRequestInFlight(
      fragmentIdentifier,
      fragmentOwner,
    );
    if (networkPromise != null) {
      throw networkPromise;
    }

    // 5. If a cached value still isn't available, raise a warning.
    // This means that we're trying to read a fragment that isn't available
    // and isn't being fetched at all.
    warning(
      false,
      'Relay: Tried reading fragment `%s` declared in ' +
        '`%s`, but it has missing data and its parent query `%s` is not ' +
        'being fetched.\n' +
        'This might be fixed by by re-running the Relay Compiler. ' +
        ' Otherwise, make sure of the following:\n' +
        '* You are correctly fetching `%s` if you are using a ' +
        '"store-only" `fetchPolicy`.\n' +
        "* Other queries aren't accidentally fetching and overwriting " +
        'the data for this fragment.\n' +
        '* Any related mutations or subscriptions are fetching all of ' +
        'the data for this fragment.\n' +
        "* Any related store updaters aren't accidentally deleting " +
        'data for this fragment.',
      fragmentNode.name,
      componentDisplayName,
      parentQueryName,
      parentQueryName,
    );

    return getFragmentResult(fragmentIdentifier, snapshot);
  }

  readSpec(
    fragmentNodes: {[string]: ReaderFragment, ...},
    fragmentRefs: {[string]: mixed, ...},
    componentDisplayName: string,
  ): {[string]: FragmentResult, ...} {
    return mapObject(fragmentNodes, (fragmentNode, fragmentKey) => {
      const fragmentRef = fragmentRefs[fragmentKey];
      return this.read(
        fragmentNode,
        fragmentRef,
        componentDisplayName,
        fragmentKey,
      );
    });
  }

  subscribe(fragmentResult: FragmentResult, callback: () => void): Disposable {
    const environment = this._environment;
    const {cacheKey} = fragmentResult;
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return {dispose: () => {}};
    }

    // 1. Check for any updates missed during render phase
    // TODO(T44066760): More efficiently detect if we missed an update
    const [didMissUpdates, currentSnapshot] = this.checkMissedUpdates(
      fragmentResult,
    );

    // 2. If an update was missed, notify the component so it updates with
    // latest data.
    if (didMissUpdates) {
      callback();
    }

    // 3. Establish subscriptions on the snapshot(s)
    const dataSubscriptions = [];
    if (Array.isArray(renderedSnapshot)) {
      invariant(
        Array.isArray(currentSnapshot),
        'Relay: Expected snapshots to be plural. ' +
          "If you're seeing this, this is likely a bug in Relay.",
      );
      currentSnapshot.forEach((snapshot, idx) => {
        dataSubscriptions.push(
          environment.subscribe(snapshot, latestSnapshot => {
            this._updatePluralSnapshot(
              cacheKey,
              currentSnapshot,
              latestSnapshot,
              idx,
            );
            callback();
          }),
        );
      });
    } else {
      invariant(
        currentSnapshot != null && !Array.isArray(currentSnapshot),
        'Relay: Expected snapshot to be singular. ' +
          "If you're seeing this, this is likely a bug in Relay.",
      );
      dataSubscriptions.push(
        environment.subscribe(currentSnapshot, latestSnapshot => {
          this._cache.set(
            cacheKey,
            getFragmentResult(cacheKey, latestSnapshot),
          );
          callback();
        }),
      );
    }

    return {
      dispose: () => {
        dataSubscriptions.map(s => s.dispose());
        this._cache.delete(cacheKey);
      },
    };
  }

  subscribeSpec(
    fragmentResults: {[string]: FragmentResult, ...},
    callback: () => void,
  ): Disposable {
    const disposables = Object.keys(fragmentResults).map(key =>
      this.subscribe(fragmentResults[key], callback),
    );
    return {
      dispose: () => {
        disposables.forEach(disposable => {
          disposable.dispose();
        });
      },
    };
  }

  checkMissedUpdates(
    fragmentResult: FragmentResult,
  ): [boolean, SingularOrPluralSnapshot | null] {
    const environment = this._environment;
    const {cacheKey} = fragmentResult;
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return [false, null];
    }

    let didMissUpdates = false;

    if (Array.isArray(renderedSnapshot)) {
      const currentSnapshots = [];
      renderedSnapshot.forEach((snapshot, idx) => {
        let currentSnapshot = environment.lookup(snapshot.selector);
        const renderData = snapshot.data;
        const currentData = currentSnapshot.data;
        const updatedData = recycleNodesInto(renderData, currentData);
        if (updatedData !== renderData) {
          currentSnapshot = {...currentSnapshot, data: updatedData};
          didMissUpdates = true;
        }
        currentSnapshots[idx] = currentSnapshot;
      });
      if (didMissUpdates) {
        this._cache.set(
          cacheKey,
          getFragmentResult(cacheKey, currentSnapshots),
        );
      }
      return [didMissUpdates, currentSnapshots];
    }
    let currentSnapshot = environment.lookup(renderedSnapshot.selector);
    const renderData = renderedSnapshot.data;
    const currentData = currentSnapshot.data;
    const updatedData = recycleNodesInto(renderData, currentData);
    currentSnapshot = {
      data: updatedData,
      isMissingData: currentSnapshot.isMissingData,
      seenRecords: currentSnapshot.seenRecords,
      selector: currentSnapshot.selector,
    };
    if (updatedData !== renderData) {
      this._cache.set(cacheKey, getFragmentResult(cacheKey, currentSnapshot));
      didMissUpdates = true;
    }
    return [didMissUpdates, currentSnapshot];
  }

  checkMissedUpdatesSpec(fragmentResults: {
    [string]: FragmentResult,
    ...,
  }): boolean {
    return Object.keys(fragmentResults).some(
      key => this.checkMissedUpdates(fragmentResults[key])[0],
    );
  }

  _getAndSavePromiseForFragmentRequestInFlight(
    cacheKey: string,
    fragmentOwner: RequestDescriptor,
  ): Promise<void> | null {
    const environment = this._environment;
    const networkPromise =
      getPromiseForActiveRequest(environment, fragmentOwner) ??
      getPromiseForPendingOperationAffectingOwner(environment, fragmentOwner);

    if (!networkPromise) {
      return null;
    }
    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    const promise = networkPromise
      .then(() => {
        this._cache.delete(cacheKey);
      })
      .catch(error => {
        this._cache.set(cacheKey, error);
      });
    this._cache.set(cacheKey, promise);

    // $FlowExpectedError Expando to annotate Promises.
    promise.displayName = 'Relay(' + fragmentOwner.node.params.name + ')';
    return promise;
  }

  _updatePluralSnapshot(
    cacheKey: string,
    baseSnapshots: $ReadOnlyArray<Snapshot>,
    latestSnapshot: Snapshot,
    idx: number,
  ): void {
    const currentFragmentResult = this._cache.get(cacheKey);
    if (
      isPromise(currentFragmentResult) ||
      currentFragmentResult instanceof Error
    ) {
      reportInvalidCachedData(latestSnapshot.selector.node.name);
      return;
    }

    const currentSnapshot = currentFragmentResult?.snapshot;
    if (currentSnapshot && !Array.isArray(currentSnapshot)) {
      reportInvalidCachedData(latestSnapshot.selector.node.name);
      return;
    }

    const nextSnapshots = currentSnapshot
      ? [...currentSnapshot]
      : [...baseSnapshots];
    nextSnapshots[idx] = latestSnapshot;
    this._cache.set(cacheKey, getFragmentResult(cacheKey, nextSnapshots));
  }
}

function reportInvalidCachedData(nodeName: string): void {
  invariant(
    false,
    'Relay: Expected to find cached data for plural fragment `%s` when ' +
      'receiving a subscription. ' +
      "If you're seeing this, this is likely a bug in Relay.",
    nodeName,
  );
}

function createFragmentResource(environment: IEnvironment): FragmentResource {
  return new FragmentResourceImpl(environment);
}

const dataResources: IMap<IEnvironment, FragmentResource> = WEAKMAP_SUPPORTED
  ? new WeakMap()
  : new Map();

function getFragmentResourceForEnvironment(
  environment: IEnvironment,
): FragmentResourceImpl {
  const cached = dataResources.get(environment);
  if (cached) {
    return cached;
  }
  const newDataResource = createFragmentResource(environment);
  dataResources.set(environment, newDataResource);
  return newDataResource;
}

module.exports = {
  createFragmentResource,
  getFragmentResourceForEnvironment,
};
