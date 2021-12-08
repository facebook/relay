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

import type {Cache} from './LRUCache';
import type {QueryResource, QueryResult} from './QueryResource';
import type {
  ConcreteRequest,
  DataID,
  Disposable,
  IEnvironment,
  ReaderFragment,
  RequestDescriptor,
  Snapshot,
} from 'relay-runtime';

const LRUCache = require('./LRUCache');
const {getQueryResourceForEnvironment} = require('./QueryResource');
const SuspenseResource = require('./SuspenseResource');
const invariant = require('invariant');
const {
  RelayFeatureFlags,
  __internal: {fetchQuery, getPromiseForActiveRequest},
  createOperationDescriptor,
  getFragmentIdentifier,
  getPendingOperationsForFragment,
  getSelector,
  getVariablesFromFragment,
  isPromise,
  recycleNodesInto,
  reportMissingRequiredFields,
} = require('relay-runtime');

export type FragmentResource = FragmentResourceImpl;

type FragmentResourceCache = Cache<
  | {|
      kind: 'pending',
      pendingOperations: $ReadOnlyArray<RequestDescriptor>,
      promise: Promise<mixed>,
      result: FragmentResult,
    |}
  | {|kind: 'done', result: FragmentResult|},
>;

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}

type SingularOrPluralSnapshot = Snapshot | $ReadOnlyArray<Snapshot>;

opaque type FragmentResult: {data: mixed, ...} = {|
  cacheKey: string,
  data: mixed,
  isMissingData: boolean,
  snapshot: SingularOrPluralSnapshot | null,
  storeEpoch: number,
|};

// TODO: Fix to not rely on LRU. If the number of active fragments exceeds this
// capacity, readSpec() will fail to find cached entries and break object
// identity even if data hasn't changed.
const CACHE_CAPACITY = 1000000;

// this is frozen so that users don't accidentally push data into the array
const CONSTANT_READONLY_EMPTY_ARRAY = Object.freeze([]);

function isMissingData(snapshot: SingularOrPluralSnapshot): boolean {
  if (Array.isArray(snapshot)) {
    return snapshot.some(s => s.isMissingData);
  }
  return snapshot.isMissingData;
}

function hasMissingClientEdges(snapshot: SingularOrPluralSnapshot): boolean {
  if (Array.isArray(snapshot)) {
    return snapshot.some(s => (s.missingClientEdges?.length ?? 0) > 0);
  }
  return (snapshot.missingClientEdges?.length ?? 0) > 0;
}

function singularOrPluralForEach(
  snapshot: SingularOrPluralSnapshot,
  f: Snapshot => void,
): void {
  if (Array.isArray(snapshot)) {
    snapshot.forEach(f);
  } else {
    f(snapshot);
  }
}

function getFragmentResult(
  cacheKey: string,
  snapshot: SingularOrPluralSnapshot,
  storeEpoch: number,
): FragmentResult {
  if (Array.isArray(snapshot)) {
    return {
      cacheKey,
      snapshot,
      data: snapshot.map(s => s.data),
      isMissingData: isMissingData(snapshot),
      storeEpoch,
    };
  }
  return {
    cacheKey,
    snapshot,
    data: snapshot.data,
    isMissingData: isMissingData(snapshot),
    storeEpoch,
  };
}

/**
 * The purpose of this cache is to allow information to be passed from an
 * initial read which suspends through to the commit that follows a subsequent
 * successful read. Specifically, the QueryResource result for the data fetch
 * is passed through so that that query can be retained on commit.
 */
class ClientEdgeQueryResultsCache {
  _cache: Map<string, [Array<QueryResult>, SuspenseResource]> = new Map();
  _retainCounts: Map<string, number> = new Map();
  _environment: IEnvironment;

  constructor(environment: IEnvironment) {
    this._environment = environment;
  }

  get(fragmentIdentifier: string): void | Array<QueryResult> {
    return this._cache.get(fragmentIdentifier)?.[0] ?? undefined;
  }

  recordQueryResults(
    fragmentIdentifier: string,
    value: Array<QueryResult>, // may be mutated after being passed here
  ): void {
    const existing = this._cache.get(fragmentIdentifier);
    if (!existing) {
      const suspenseResource = new SuspenseResource(() =>
        this._retain(fragmentIdentifier),
      );
      this._cache.set(fragmentIdentifier, [value, suspenseResource]);
      suspenseResource.temporaryRetain(this._environment);
    } else {
      const [existingResults, suspenseResource] = existing;
      value.forEach(queryResult => {
        existingResults.push(queryResult);
      });
      suspenseResource.temporaryRetain(this._environment);
    }
  }

  _retain(id) {
    const retainCount = (this._retainCounts.get(id) ?? 0) + 1;
    this._retainCounts.set(id, retainCount);
    return {
      dispose: () => {
        const newRetainCount = (this._retainCounts.get(id) ?? 0) - 1;
        if (newRetainCount > 0) {
          this._retainCounts.set(id, newRetainCount);
        } else {
          this._retainCounts.delete(id);
          this._cache.delete(id);
        }
      },
    };
  }
}

class FragmentResourceImpl {
  _environment: IEnvironment;
  _cache: FragmentResourceCache;
  _clientEdgeQueryResultsCache: void | ClientEdgeQueryResultsCache;

  constructor(environment: IEnvironment) {
    this._environment = environment;
    this._cache = LRUCache.create(CACHE_CAPACITY);
    if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
      this._clientEdgeQueryResultsCache = new ClientEdgeQueryResultsCache(
        environment,
      );
    }
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
        isMissingData: false,
        snapshot: null,
        storeEpoch: 0,
      };
    }

    const storeEpoch = environment.getStore().getEpoch();

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
          isMissingData: false,
          snapshot: CONSTANT_READONLY_EMPTY_ARRAY,
          storeEpoch,
        };
      }
    }

    // Now we actually attempt to read the fragment:

    // 1. Check if there's a cached value for this fragment
    const cachedValue = this._cache.get(fragmentIdentifier);
    if (cachedValue != null) {
      if (cachedValue.kind === 'pending' && isPromise(cachedValue.promise)) {
        environment.__log({
          name: 'suspense.fragment',
          data: cachedValue.result.data,
          fragment: fragmentNode,
          isRelayHooks: true,
          isMissingData: cachedValue.result.isMissingData,
          isPromiseCached: true,
          pendingOperations: cachedValue.pendingOperations,
        });
        throw cachedValue.promise;
      }

      if (cachedValue.kind === 'done' && cachedValue.result.snapshot) {
        this._reportMissingRequiredFieldsInSnapshot(
          cachedValue.result.snapshot,
        );
        return cachedValue.result;
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

    const fragmentResult = getFragmentResult(
      fragmentIdentifier,
      snapshot,
      storeEpoch,
    );
    if (!fragmentResult.isMissingData) {
      this._reportMissingRequiredFieldsInSnapshot(snapshot);

      this._cache.set(fragmentIdentifier, {
        kind: 'done',
        result: fragmentResult,
      });
      return fragmentResult;
    }

    // 3. If we don't have data in the store, there's two cases where we should
    // suspend to await the data: First if any client edges were traversed where
    // the destination record was missing data; in that case we initiate a query
    // here to fetch the missing data. Second, there may already be a request
    // in flight for the fragment's parent query, or for another operation that
    //  may affect the parent's query data, such as a mutation or subscription.
    // For any of these cases we can get a promise, which we will cache and
    // suspend on.

    // First, initiate a query for any client edges that were missing data:
    let clientEdgeRequests: ?Array<RequestDescriptor> = null;
    if (
      RelayFeatureFlags.ENABLE_CLIENT_EDGES &&
      hasMissingClientEdges(snapshot)
    ) {
      clientEdgeRequests = [];
      const queryResource = getQueryResourceForEnvironment(this._environment);
      const queryResults = [];
      singularOrPluralForEach(snapshot, snap => {
        snap.missingClientEdges?.forEach(
          ({request, clientEdgeDestinationID}) => {
            const {queryResult, requestDescriptor} =
              this._performClientEdgeQuery(
                queryResource,
                fragmentNode,
                fragmentRef,
                request,
                clientEdgeDestinationID,
              );
            queryResults.push(queryResult);
            clientEdgeRequests?.push(requestDescriptor);
          },
        );
      });
      // Store the query so that it can be retained when our own fragment is
      // subscribed to. This merges with any existing query results:
      invariant(
        this._clientEdgeQueryResultsCache != null,
        'Client edge query result cache should exist when ENABLE_CLIENT_EDGES is on.',
      );
      this._clientEdgeQueryResultsCache.recordQueryResults(
        fragmentIdentifier,
        queryResults,
      );
    }
    let clientEdgePromises = null;
    if (RelayFeatureFlags.ENABLE_CLIENT_EDGES && clientEdgeRequests) {
      clientEdgePromises = clientEdgeRequests
        .map(request => getPromiseForActiveRequest(this._environment, request))
        .filter(p => p != null);
    }

    // Finally look for operations in flight for our parent query:
    const fragmentOwner =
      fragmentSelector.kind === 'PluralReaderSelector'
        ? fragmentSelector.selectors[0].owner
        : fragmentSelector.owner;
    const parentQueryPromiseResult =
      this._getAndSavePromiseForFragmentRequestInFlight(
        fragmentIdentifier,
        fragmentNode,
        fragmentOwner,
        fragmentResult,
      );
    const parentQueryPromiseResultPromise = parentQueryPromiseResult?.promise; // for refinement

    if (
      clientEdgePromises?.length ||
      isPromise(parentQueryPromiseResultPromise)
    ) {
      environment.__log({
        name: 'suspense.fragment',
        data: fragmentResult.data,
        fragment: fragmentNode,
        isRelayHooks: true,
        isPromiseCached: false,
        isMissingData: fragmentResult.isMissingData,
        pendingOperations: [
          ...(parentQueryPromiseResult?.pendingOperations ?? []),
          ...(clientEdgeRequests ?? []),
        ],
      });
      throw clientEdgePromises?.length
        ? Promise.all([parentQueryPromiseResultPromise, ...clientEdgePromises])
        : parentQueryPromiseResultPromise;
    }

    this._reportMissingRequiredFieldsInSnapshot(snapshot);
    return getFragmentResult(fragmentIdentifier, snapshot, storeEpoch);
  }

  _performClientEdgeQuery(
    queryResource: QueryResource,
    fragmentNode: ReaderFragment,
    fragmentRef: mixed,
    request: ConcreteRequest,
    clientEdgeDestinationID: DataID,
  ) {
    const originalVariables = getVariablesFromFragment(
      fragmentNode,
      fragmentRef,
    );
    const variables = {
      ...originalVariables,
      id: clientEdgeDestinationID, // TODO should be a reserved name
    };
    const operation = createOperationDescriptor(
      request,
      variables,
      {}, //  TODO cacheConfig should probably inherent from parent operation
    );
    const fetchObservable = fetchQuery(this._environment, operation);
    const queryResult = queryResource.prepare(
      operation,
      fetchObservable,
      // TODO should inherent render policy etc. from parent operation
    );
    return {
      requestDescriptor: operation.request,
      queryResult,
    };
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
    const [didMissUpdates, currentSnapshot] =
      this.checkMissedUpdates(fragmentResult);

    // 2. If an update was missed, notify the component so it updates with
    // the latest data.
    if (didMissUpdates) {
      callback();
    }

    // 3. Establish subscriptions on the snapshot(s)
    const disposables = [];
    if (Array.isArray(renderedSnapshot)) {
      invariant(
        Array.isArray(currentSnapshot),
        'Relay: Expected snapshots to be plural. ' +
          "If you're seeing this, this is likely a bug in Relay.",
      );
      currentSnapshot.forEach((snapshot, idx) => {
        disposables.push(
          environment.subscribe(snapshot, latestSnapshot => {
            const storeEpoch = environment.getStore().getEpoch();
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
      disposables.push(
        environment.subscribe(currentSnapshot, latestSnapshot => {
          const storeEpoch = environment.getStore().getEpoch();
          this._cache.set(cacheKey, {
            kind: 'done',
            result: getFragmentResult(cacheKey, latestSnapshot, storeEpoch),
          });
          callback();
        }),
      );
    }

    if (RelayFeatureFlags.ENABLE_CLIENT_EDGES) {
      const clientEdgeQueryResults =
        this._clientEdgeQueryResultsCache?.get(cacheKey) ?? undefined;
      if (clientEdgeQueryResults?.length) {
        const queryResource = getQueryResourceForEnvironment(this._environment);
        clientEdgeQueryResults.forEach(queryResult => {
          disposables.push(queryResource.retain(queryResult));
        });
      }
    }

    return {
      dispose: () => {
        disposables.forEach(s => s.dispose());
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
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return [false, null];
    }

    let storeEpoch = null;
    // Bail out if the store hasn't been written since last read
    storeEpoch = environment.getStore().getEpoch();
    if (fragmentResult.storeEpoch === storeEpoch) {
      return [false, fragmentResult.snapshot];
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
        this._cache.set(cacheKey, {
          kind: 'done',
          result: getFragmentResult(cacheKey, currentSnapshots, storeEpoch),
        });
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
      missingClientEdges: currentSnapshot.missingClientEdges,
      seenRecords: currentSnapshot.seenRecords,
      selector: currentSnapshot.selector,
      missingRequiredFields: currentSnapshot.missingRequiredFields,
    };
    if (updatedData !== renderData) {
      this._cache.set(cacheKey, {
        kind: 'done',
        result: getFragmentResult(cacheKey, updatedCurrentSnapshot, storeEpoch),
      });
    }
    return [updatedData !== renderData, updatedCurrentSnapshot];
  }

  checkMissedUpdatesSpec(fragmentResults: {
    [string]: FragmentResult,
    ...
  }): boolean {
    return Object.keys(fragmentResults).some(
      key => this.checkMissedUpdates(fragmentResults[key])[0],
    );
  }

  _getAndSavePromiseForFragmentRequestInFlight(
    cacheKey: string,
    fragmentNode: ReaderFragment,
    fragmentOwner: RequestDescriptor,
    fragmentResult: FragmentResult,
  ): {|
    promise: Promise<void>,
    pendingOperations: $ReadOnlyArray<RequestDescriptor>,
  |} | null {
    const pendingOperationsResult = getPendingOperationsForFragment(
      this._environment,
      fragmentNode,
      fragmentOwner,
    );
    if (pendingOperationsResult == null) {
      return null;
    }

    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    const networkPromise = pendingOperationsResult.promise;
    const pendingOperations = pendingOperationsResult.pendingOperations;
    const promise = networkPromise
      .then(() => {
        this._cache.delete(cacheKey);
      })
      .catch((error: Error) => {
        this._cache.delete(cacheKey);
      });
    // $FlowExpectedError[prop-missing] Expando to annotate Promises.
    promise.displayName = networkPromise.displayName;
    this._cache.set(cacheKey, {
      kind: 'pending',
      pendingOperations,
      promise,
      result: fragmentResult,
    });
    return {promise, pendingOperations};
  }

  _updatePluralSnapshot(
    cacheKey: string,
    baseSnapshots: $ReadOnlyArray<Snapshot>,
    latestSnapshot: Snapshot,
    idx: number,
    storeEpoch: number,
  ): void {
    const currentFragmentResult = this._cache.get(cacheKey);
    if (isPromise(currentFragmentResult)) {
      reportInvalidCachedData(latestSnapshot.selector.node.name);
      return;
    }

    const currentSnapshot = currentFragmentResult?.result?.snapshot;
    if (currentSnapshot && !Array.isArray(currentSnapshot)) {
      reportInvalidCachedData(latestSnapshot.selector.node.name);
      return;
    }

    const nextSnapshots = currentSnapshot
      ? [...currentSnapshot]
      : [...baseSnapshots];
    nextSnapshots[idx] = latestSnapshot;
    this._cache.set(cacheKey, {
      kind: 'done',
      result: getFragmentResult(cacheKey, nextSnapshots, storeEpoch),
    });
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
