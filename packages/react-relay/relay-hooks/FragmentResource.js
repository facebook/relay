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

const {
  __internal: {getPromiseForActiveRequest},
  getFragmentIdentifier,
  getSelector,
  isPromise,
  recycleNodesInto,
  reportMissingRequiredFields,
  RelayFeatureFlags,
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

type FragmentResourceCache = Cache<Promise<mixed> | FragmentResult>;

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}

type SeenRecords = $PropertyType<Snapshot, 'seenRecords'>;
type SnapshotWithoutSeenRecords = $ReadOnly<{|
  ...$Diff<Snapshot, {|seenRecords: SeenRecords, isMissingData: boolean|}>,
  seenRecords?: SeenRecords,
  isMissingData?: boolean,
|}>;
type SingularOrPluralSnapshot =
  | SnapshotWithoutSeenRecords
  | $ReadOnlyArray<SnapshotWithoutSeenRecords>;
type SingularOrPluarlStoreSnapshot = Snapshot | $ReadOnlyArray<Snapshot>;

opaque type FragmentResult: {data: mixed, ...} = {|
  cacheKey: string,
  data: mixed,
  snapshot: SingularOrPluralSnapshot | null,
  storeEpoch: number | null,
|};

// TODO: Fix to not rely on LRU. If the number of active fragments exceeds this
// capacity, readSpec() will fail to find cached entries and break object
// identity even if data hasn't changed.
const CACHE_CAPACITY = 1000000;

// this is frozen so that users don't accidentally push data into the array
const CONSTANT_READONLY_EMPTY_ARRAY = Object.freeze([]);

function isMissingData(snapshot: SingularOrPluralSnapshot) {
  if (Array.isArray(snapshot)) {
    return snapshot.some(s => s.isMissingData);
  }
  return snapshot.isMissingData;
}

function getFragmentResult(
  cacheKey: string,
  snapshot: SingularOrPluralSnapshot,
  storeEpoch: number | null,
): FragmentResult {
  if (Array.isArray(snapshot)) {
    return {
      cacheKey,
      snapshot:
        RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION ===
        'reduce-snapshot-size'
          ? snapshot.map(s => ({
              data: s.data,
              selector: s.selector,
              missingRequiredFields: s.missingRequiredFields,
            }))
          : snapshot,
      data: snapshot.map(s => s.data),
      storeEpoch,
    };
  }
  return {
    cacheKey,
    snapshot:
      RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION ===
      'reduce-snapshot-size'
        ? {
            data: snapshot.data,
            selector: snapshot.selector,
            missingRequiredFields: snapshot.missingRequiredFields,
          }
        : snapshot,
    data: snapshot.data,
    storeEpoch,
  };
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
   * Like `read`, but with a pre-computed fragmentIdentifier that should be
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
    // This is a convenience when consuming fragments via a HOC API, when the
    // prop corresponding to the fragment ref might be passed as null.
    if (fragmentRef == null) {
      return {
        cacheKey: fragmentIdentifier,
        data: null,
        snapshot: null,
        storeEpoch: null,
      };
    }

    const storeEpoch =
      RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION === 'epoch'
        ? environment.getStore().getEpoch()
        : null;

    // If fragmentRef is plural, ensure that it is an array.
    // If it's empty, return the empty array directly before doing any more work.
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
        return {
          cacheKey: fragmentIdentifier,
          data: CONSTANT_READONLY_EMPTY_ARRAY,
          snapshot: CONSTANT_READONLY_EMPTY_ARRAY,
          storeEpoch,
        };
      }
    }

    // Now we actually attempt to read the fragment:

    // 1. Check if there's a cached value for this fragment
    const cachedValue = this._cache.get(fragmentIdentifier);
    if (cachedValue != null) {
      if (isPromise(cachedValue)) {
        throw cachedValue;
      }
      if (cachedValue.snapshot) {
        this._reportMissingRequiredFieldsInSnapshot(cachedValue.snapshot);
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

    if (!isMissingData(snapshot)) {
      this._reportMissingRequiredFieldsInSnapshot(snapshot);

      const fragmentResult = getFragmentResult(
        fragmentIdentifier,
        snapshot,
        storeEpoch,
      );
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
      fragmentNode,
      fragmentOwner,
    );
    if (networkPromise != null) {
      throw networkPromise;
    }

    this._reportMissingRequiredFieldsInSnapshot(snapshot);
    return getFragmentResult(fragmentIdentifier, snapshot, storeEpoch);
  }

  _reportMissingRequiredFieldsInSnapshot(snapshot: SingularOrPluralSnapshot) {
    if (Array.isArray(snapshot)) {
      snapshot.forEach(s => {
        if (s.missingRequiredFields != null) {
          reportMissingRequiredFields(
            this._environment,
            s.missingRequiredFields,
          );
        }
      });
    } else {
      if (snapshot.missingRequiredFields != null) {
        reportMissingRequiredFields(
          this._environment,
          snapshot.missingRequiredFields,
        );
      }
    }
  }

  readSpec(
    fragmentNodes: {[string]: ReaderFragment, ...},
    fragmentRefs: {[string]: mixed, ...},
    componentDisplayName: string,
  ): {[string]: FragmentResult, ...} {
    const result = {};
    for (const key in fragmentNodes) {
      result[key] = this.read(
        fragmentNodes[key],
        fragmentRefs[key],
        componentDisplayName,
        key,
      );
    }
    return result;
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
    // the latest data.
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
            const storeEpoch =
              RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION ===
              'epoch'
                ? environment.getStore().getEpoch()
                : null;
            this._updatePluralSnapshot(
              cacheKey,
              currentSnapshot,
              latestSnapshot,
              idx,
              storeEpoch,
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
          const storeEpoch =
            RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION === 'epoch'
              ? environment.getStore().getEpoch()
              : null;
          this._cache.set(
            cacheKey,
            getFragmentResult(cacheKey, latestSnapshot, storeEpoch),
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
  ): [boolean, SingularOrPluarlStoreSnapshot | null] {
    const environment = this._environment;
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return [false, null];
    }

    let storeEpoch = null;
    // Bail out if the store hasn't been written since last read
    if (RelayFeatureFlags.ENABLE_FRAGMENT_RESOURCE_OPTIMIZATION === 'epoch') {
      storeEpoch = environment.getStore().getEpoch();
      if (fragmentResult.storeEpoch === storeEpoch) {
        // $FlowFixMe In current feature flag path, the snapshot is expected to contain full data
        return [false, fragmentResult.snapshot];
      }
    }

    const {cacheKey} = fragmentResult;

    if (Array.isArray(renderedSnapshot)) {
      let didMissUpdates = false;
      const currentSnapshots = [];
      renderedSnapshot.forEach((snapshot, idx) => {
        let currentSnapshot: Snapshot = environment.lookup(snapshot.selector);
        const renderData = snapshot.data;
        const currentData = currentSnapshot.data;
        const updatedData = recycleNodesInto(renderData, currentData);
        if (updatedData !== renderData) {
          currentSnapshot = {...currentSnapshot, data: updatedData};
          didMissUpdates = true;
        }
        currentSnapshots[idx] = currentSnapshot;
      });
      // Only update the cache when the data is changed to avoid
      // returning different `data` instances
      if (didMissUpdates) {
        this._cache.set(
          cacheKey,
          getFragmentResult(cacheKey, currentSnapshots, storeEpoch),
        );
      }
      return [didMissUpdates, currentSnapshots];
    }
    const currentSnapshot = environment.lookup(renderedSnapshot.selector);
    const renderData = renderedSnapshot.data;
    const currentData = currentSnapshot.data;
    const updatedData = recycleNodesInto(renderData, currentData);
    const updatedCurrentSnapshot: Snapshot = {
      data: updatedData,
      isMissingData: currentSnapshot.isMissingData,
      seenRecords: currentSnapshot.seenRecords,
      selector: currentSnapshot.selector,
      missingRequiredFields: currentSnapshot.missingRequiredFields,
    };
    if (updatedData !== renderData) {
      this._cache.set(
        cacheKey,
        getFragmentResult(cacheKey, updatedCurrentSnapshot, storeEpoch),
      );
    }
    return [updatedData !== renderData, updatedCurrentSnapshot];
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
    fragmentNode: ReaderFragment,
    fragmentOwner: RequestDescriptor,
  ): Promise<void> | null {
    const environment = this._environment;
    let networkPromise = getPromiseForActiveRequest(environment, fragmentOwner);
    let pendingOperationName;

    if (networkPromise != null) {
      pendingOperationName = fragmentOwner.node.params.name;
    } else {
      const result = environment
        .getOperationTracker()
        .getPendingOperationsAffectingOwner(fragmentOwner);
      const pendingOperations = result?.pendingOperations;
      networkPromise = result?.promise ?? null;
      pendingOperationName =
        pendingOperations?.map(op => op.node.params.name).join(',') ?? null;
    }

    if (!networkPromise) {
      return null;
    }

    if (pendingOperationName == null || pendingOperationName.length === 0) {
      pendingOperationName = 'Unknown pending operation';
    }

    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    const promise = networkPromise
      .then(() => {
        this._cache.delete(cacheKey);
      })
      .catch((error: Error) => {
        this._cache.delete(cacheKey);
      });
    this._cache.set(cacheKey, promise);

    const fragmentName = fragmentNode.name;
    const promiseDisplayName =
      pendingOperationName === fragmentName
        ? `Relay(${pendingOperationName})`
        : `Relay(${pendingOperationName}:${fragmentName})`;
    // $FlowExpectedError[prop-missing] Expando to annotate Promises.
    promise.displayName = promiseDisplayName;
    return promise;
  }

  _updatePluralSnapshot(
    cacheKey: string,
    baseSnapshots: $ReadOnlyArray<Snapshot>,
    latestSnapshot: Snapshot,
    idx: number,
    storeEpoch: number | null,
  ): void {
    const currentFragmentResult = this._cache.get(cacheKey);
    if (isPromise(currentFragmentResult)) {
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
    this._cache.set(
      cacheKey,
      getFragmentResult(cacheKey, nextSnapshots, storeEpoch),
    );
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
