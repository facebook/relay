/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

import type {
  LoadQueryOptions,
  PreloadableConcreteRequest,
  PreloadedQueryInner,
} from './EntryPointTypes.flow';
import type {
  ConcreteRequest,
  GraphQLResponse,
  GraphQLTaggedNode,
  IEnvironment,
  OperationDescriptor,
  OperationType,
  RequestIdentifier,
  RequestParameters,
} from 'relay-runtime';

const invariant = require('invariant');
const React = require('react');
const {
  Observable,
  PreloadableQueryRegistry,
  RelayFeatureFlags,
  ReplaySubject,
  __internal: {fetchQueryDeduped},
  createOperationDescriptor,
  getRequest,
  getRequestIdentifier,
} = require('relay-runtime');
const warning = require('warning');

let RenderDispatcher = null;
let fetchKey = 100001;

function useTrackLoadQueryInRender() {
  if (RenderDispatcher === null) {
    // Flow does not know of React internals (rightly so), but we need to
    // ensure here that this function isn't called inside render.
    RenderDispatcher =
      // $FlowFixMe[prop-missing]
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        ?.ReactCurrentDispatcher?.current;
  }
}

function loadQuery<TQuery: OperationType, TEnvironmentProviderOptions>(
  environment: IEnvironment,
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: TQuery['variables'],
  options?: ?LoadQueryOptions,
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
): PreloadedQueryInner<TQuery, TEnvironmentProviderOptions> {
  // This code ensures that we don't call loadQuery during render.
  const CurrentDispatcher =
    // $FlowFixMe[prop-missing]
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      ?.ReactCurrentDispatcher?.current;
  warning(
    RenderDispatcher == null || CurrentDispatcher !== RenderDispatcher,
    'Relay: `%s` should not be called inside a React render function.',
    options?.__nameForWarning ?? 'loadQuery',
  );

  // Every time you call loadQuery, we will generate a new fetchKey.
  // This will ensure that every query reference that is created and
  // passed to usePreloadedQuery is independently evaluated,
  // even if they are for the same query/variables.
  // Specifically, we want to avoid a case where we try to refetch a
  // query by calling loadQuery a second time, and have the Suspense
  // cache in usePreloadedQuery reuse the cached result instead of
  // re-evaluating the new query ref and triggering a refetch if
  // necessary.
  fetchKey++;

  const fetchPolicy = options?.fetchPolicy ?? 'store-or-network';
  const networkCacheConfig = {
    ...options?.networkCacheConfig,
    force: true,
  };

  // executeWithNetworkSource will retain and execute an operation
  // against the Relay store, given an Observable that would provide
  // the network events for the operation.
  let retainReference;
  let didExecuteNetworkSource = false;
  const executeWithNetworkSource = (
    operation: OperationDescriptor,
    networkObservable: Observable<GraphQLResponse>,
  ): Observable<GraphQLResponse> => {
    didExecuteNetworkSource = true;
    return environment.executeWithSource({
      operation,
      source: networkObservable,
    });
  };

  // N.B. For loadQuery, we unconventionally want to return an Observable
  // that isn't lazily executed, meaning that we don't want to wait
  // until the returned Observable is subscribed to to actually start
  // fetching and executing an operation; i.e. we want to execute the
  // operation eagerly, when loadQuery is called.
  // For this reason, we use an intermediate executionSubject which
  // allows us to capture the events that occur during the eager execution
  // of the operation, and then replay them to the Observable we
  // ultimately return.
  const executionSubject = new ReplaySubject();
  const returnedObservable = Observable.create(sink =>
    executionSubject.subscribe(sink),
  );

  let unsubscribeFromNetworkRequest;
  let networkError = null;
  // makeNetworkRequest will immediately start a raw network request if
  // one isn't already in flight and return an Observable that when
  // subscribed to will replay the network events that have occured so far,
  // as well as subsequent events.
  let didMakeNetworkRequest = false;
  const makeNetworkRequest = (
    params: RequestParameters,
  ): Observable<GraphQLResponse> => {
    // N.B. this function is called synchronously or not at all
    // didMakeNetworkRequest is safe to rely on in the returned value
    // Even if the request gets deduped below, we still wan't to return an
    // observable that provides the replayed network events for the query,
    // so we set this to true before deduping, to guarantee that the
    // `source` observable is returned.
    didMakeNetworkRequest = true;

    let observable;
    const subject = new ReplaySubject();
    if (RelayFeatureFlags.ENABLE_LOAD_QUERY_REQUEST_DEDUPING === true) {
      // Here, we are calling fetchQueryDeduped at the network layer level,
      // which ensures that only a single network request is active for a given
      // (environment, identifier) pair.
      // Since network requests can be started /before/ we have the query ast
      // necessary to process the results, we need to dedupe the raw requests
      // separately from deduping the operation execution; specifically,
      // if `loadQuery` is called multiple times before the query ast is available,
      // we still want the network request to be deduped.
      // - If a duplicate active network request is found, it will return an
      // Observable that replays the events of the already active request.
      // - If no duplicate active network request is found, it will call the fetchFn
      // to start the request, and return an Observable that will replay
      // the events from the network request.
      // We provide an extra key to the identifier to distinguish deduping
      // of raw network requests vs deduping of operation executions.
      const identifier: RequestIdentifier =
        'raw-network-request-' + getRequestIdentifier(params, variables);
      observable = fetchQueryDeduped(environment, identifier, () => {
        const network = environment.getNetwork();
        return network.execute(params, variables, networkCacheConfig);
      });
    } else {
      const network = environment.getNetwork();
      observable = network.execute(params, variables, networkCacheConfig);
    }

    const {unsubscribe} = observable.subscribe({
      error(err) {
        networkError = err;
        subject.error(err);
      },
      next(data) {
        subject.next(data);
      },
      complete() {
        subject.complete();
      },
    });
    unsubscribeFromNetworkRequest = unsubscribe;
    return Observable.create(sink => {
      const subjectSubscription = subject.subscribe(sink);
      return () => {
        subjectSubscription.unsubscribe();
        unsubscribeFromNetworkRequest();
      };
    });
  };

  let unsubscribeFromExecution;
  const executeDeduped = (
    operation: OperationDescriptor,
    fetchFn: () => Observable<GraphQLResponse>,
  ) => {
    if (RelayFeatureFlags.ENABLE_LOAD_QUERY_REQUEST_DEDUPING === true) {
      // N.B. at this point, if we're calling execute with a query ast (OperationDescriptor),
      // we are guaranteed to have started a network request. We set this to
      // true here as well since `makeNetworkRequest` might get skipped in the case
      // where the query ast is already available and the query executions get deduped.
      // Even if the execution gets deduped below, we still wan't to return
      // an observable that provides the replayed network events for the query,
      // so we set this to true before deduping, to guarantee that the `source`
      // observable is returned.
      didMakeNetworkRequest = true;
    }

    // Here, we are calling fetchQueryDeduped, which ensures that only
    // a single operation is active for a given (environment, identifier) pair,
    // and also tracks the active state of the operation, which is necessary
    // for our Suspense infra to later be able to suspend (or not) on
    // active operations. Even though we already dedupe raw network requests,
    // we also need to dedupe and keep track operation execution for our Suspense
    // infra, and we also want to avoid processing responses more than once, for
    // the cases where `loadQuery` might be called multiple times after the query ast
    // is available.
    // - If a duplicate active operation is found, it will return an
    // Observable that replays the events of the already active operation.
    // - If no duplicate active operation is found, it will call the fetchFn
    // to execute the operation, and return an Observable that will provide
    // the events for executing the operation.
    ({unsubscribe: unsubscribeFromExecution} = fetchQueryDeduped(
      environment,
      operation.request.identifier,
      fetchFn,
    ).subscribe({
      error(err) {
        executionSubject.error(err);
      },
      next(data) {
        executionSubject.next(data);
      },
      complete() {
        executionSubject.complete();
      },
    }));
  };

  const checkAvailabilityAndExecute = (concreteRequest: ConcreteRequest) => {
    const operation = createOperationDescriptor(
      concreteRequest,
      variables,
      networkCacheConfig,
    );
    retainReference = environment.retain(operation);
    if (fetchPolicy === 'store-only') {
      return;
    }

    // N.B. If the fetch policy allows fulfillment from the store but the
    // environment already has the data for that operation cached in the store,
    // then we do nothing.
    const shouldFetch =
      fetchPolicy !== 'store-or-network' ||
      environment.check(operation).status !== 'available';

    if (shouldFetch) {
      executeDeduped(operation, () => {
        // N.B. Since we have the operation synchronously available here,
        // we can immediately fetch and execute the operation.
        const networkObservable = makeNetworkRequest(concreteRequest.params);
        const executeObservable = executeWithNetworkSource(
          operation,
          networkObservable,
        );
        return executeObservable;
      });
    }
  };

  let params;
  let cancelOnLoadCallback;
  let queryId;
  if (preloadableRequest.kind === 'PreloadableConcreteRequest') {
    const preloadableConcreteRequest: PreloadableConcreteRequest<TQuery> =
      (preloadableRequest: $FlowFixMe);
    ({params} = preloadableConcreteRequest);

    ({id: queryId} = params);
    invariant(
      queryId !== null,
      'Relay: `loadQuery` requires that preloadable query `%s` has a persisted query id',
      params.name,
    );

    const module = PreloadableQueryRegistry.get(queryId);

    if (module != null) {
      checkAvailabilityAndExecute(module);
    } else {
      // If the module isn't synchronously available, we launch the
      // network request immediately if the fetchPolicy might produce
      // a network fetch, regardless of the state of the store cache. We
      // do this because we can't check if a query is cached without the
      // ast, and we know that if we don't have the query ast
      // available, then this query could've never been written to the
      // store in the first place, so it couldn't have been cached.
      const networkObservable =
        fetchPolicy === 'store-only' ? null : makeNetworkRequest(params);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      ({dispose: cancelOnLoadCallback} = PreloadableQueryRegistry.onLoad(
        queryId,
        preloadedModule => {
          cancelOnLoadCallback();
          const operation = createOperationDescriptor(
            preloadedModule,
            variables,
            networkCacheConfig,
          );
          retainReference = environment.retain(operation);
          if (networkObservable != null) {
            executeDeduped(operation, () =>
              executeWithNetworkSource(operation, networkObservable),
            );
          }
        },
      ));
    }
  } else {
    const graphQlTaggedNode: GraphQLTaggedNode =
      (preloadableRequest: $FlowFixMe);
    const request = getRequest(graphQlTaggedNode);
    params = request.params;
    queryId = params.cacheID != null ? params.cacheID : params.id;
    checkAvailabilityAndExecute(request);
  }

  let isDisposed = false;
  let isReleased = false;
  let isNetworkRequestCancelled = false;
  const releaseQuery = () => {
    if (isReleased) {
      return;
    }
    retainReference && retainReference.dispose();
    isReleased = true;
  };
  const cancelNetworkRequest = () => {
    if (isNetworkRequestCancelled) {
      return;
    }
    if (didExecuteNetworkSource) {
      unsubscribeFromExecution && unsubscribeFromExecution();
    } else {
      unsubscribeFromNetworkRequest && unsubscribeFromNetworkRequest();
    }
    cancelOnLoadCallback && cancelOnLoadCallback();
    isNetworkRequestCancelled = true;
  };
  return {
    kind: 'PreloadedQuery',
    environment,
    environmentProviderOptions,
    dispose() {
      if (isDisposed) {
        return;
      }
      releaseQuery();
      cancelNetworkRequest();
      isDisposed = true;
    },
    releaseQuery,
    cancelNetworkRequest,
    fetchKey,
    id: queryId,
    // $FlowFixMe[unsafe-getters-setters] - this has no side effects
    get isDisposed() {
      return isDisposed || isReleased;
    },
    // $FlowFixMe[unsafe-getters-setters] - this has no side effects
    get networkError() {
      return networkError;
    },
    name: params.name,
    networkCacheConfig,
    fetchPolicy,
    source: didMakeNetworkRequest ? returnedObservable : undefined,
    variables,
  };
}

module.exports = {
  loadQuery,
  useTrackLoadQueryInRender,
};
