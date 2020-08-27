/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const React = require('react');

const invariant = require('invariant');

const {
  PreloadableQueryRegistry,
  ReplaySubject,
  createOperationDescriptor,
  getRequest,
  Observable,
  __internal: {fetchQueryDeduped},
} = require('relay-runtime');

import type {
  PreloadableConcreteRequest,
  PreloadedQueryInner,
  LoadQueryOptions,
} from './EntryPointTypes.flow';
import type {
  IEnvironment,
  OperationDescriptor,
  OperationType,
  GraphQLTaggedNode,
  GraphQLResponse,
} from 'relay-runtime';

const LOAD_QUERY_AST_MAX_TIMEOUT = 15 * 1000;

let RenderDispatcher = null;

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
  variables: $ElementType<TQuery, 'variables'>,
  options?: LoadQueryOptions,
  environmentProviderOptions?: TEnvironmentProviderOptions,
): PreloadedQueryInner<TQuery, TEnvironmentProviderOptions> {
  // This code ensures that we don't call loadQuery during render.
  const CurrentDispatcher =
    // $FlowFixMe[prop-missing]
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      ?.ReactCurrentDispatcher?.current;
  invariant(
    RenderDispatcher == null || CurrentDispatcher !== RenderDispatcher,
    'Relay: `loadQuery` (or `loadEntryPoint`) should not be called inside a React render function.',
  );

  const fetchPolicy = options?.fetchPolicy ?? 'store-or-network';
  const networkCacheConfig = {
    ...options?.networkCacheConfig,
    force: true,
  };

  // makeNetworkRequest will immediately start a raw network request and
  // return an Observable that when subscribing to it, will replay the
  // network events that have occured so far, as well as subsequent events.
  let madeNetworkRequest = false;
  const makeNetworkRequest = (params): Observable<GraphQLResponse> => {
    // N.B. this function is called synchronously or not at all
    // madeNetworkRequest is safe to rely on in the returned value

    madeNetworkRequest = true;
    const network = environment.getNetwork();
    const sourceObservable = network.execute(
      params,
      variables,
      networkCacheConfig,
    );

    const subject = new ReplaySubject();
    sourceObservable.subscribe({
      error(err) {
        subject.error(err);
      },
      next(data) {
        subject.next(data);
      },
      complete() {
        subject.complete();
      },
    });
    return Observable.create(sink => subject.subscribe(sink));
  };

  // executeWithNetworkSource will retain and execute an operation
  // against the Relay store, given an Observable that would provide
  // the network events for the operation.
  let retainReference;
  const executeWithNetworkSource = (
    operation: OperationDescriptor,
    networkObservable: Observable<GraphQLResponse>,
  ): Observable<GraphQLResponse> => {
    retainReference = environment.retain(operation);
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

  let unsubscribeFromExecution;
  const executeDeduped = (
    operation: OperationDescriptor,
    fetchFn: () => Observable<GraphQLResponse>,
  ) => {
    // N.B.
    // Here, we are calling fetchQueryDeduped, which ensures that only
    // a single operation is active for a given (environment, identifier) pair,
    // and also tracks the active state of the operation, which is necessary
    // for our Suspense infra to later be able to suspend (or not) on
    // active operations.
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

  const checkAvailabilityAndExecute = concreteRequest => {
    const operation = createOperationDescriptor(concreteRequest, variables);

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
  let loadQueryAstTimeoutId;
  let cancelOnLoadCallback;
  let moduleId;
  if (preloadableRequest.kind === 'PreloadableConcreteRequest') {
    const preloadableConcreteRequest: PreloadableConcreteRequest<TQuery> = (preloadableRequest: $FlowFixMe);
    ({params} = preloadableConcreteRequest);

    ({id: moduleId} = params);
    invariant(
      moduleId !== null,
      'Relay: `loadQuery` requires that preloadable query `%s` has a persisted query id',
      params.name,
    );

    const module = PreloadableQueryRegistry.get(moduleId);

    if (module != null) {
      checkAvailabilityAndExecute(module);
    } else {
      // If the module isn't synchronously available, we launch the
      // network request immediately and ignore the fetch policy.
      // Note that without the operation module we can't reliably
      // dedupe network requests, since the request identifier is
      // based on the variables the operation expects, and not
      // just the variables passed as input.
      const networkObservable = makeNetworkRequest(params);
      ({dispose: cancelOnLoadCallback} = PreloadableQueryRegistry.onLoad(
        moduleId,
        preloadedModule => {
          loadQueryAstTimeoutId != null && clearTimeout(loadQueryAstTimeoutId);
          cancelOnLoadCallback();
          const operation = createOperationDescriptor(
            preloadedModule,
            variables,
          );
          executeDeduped(operation, () =>
            executeWithNetworkSource(operation, networkObservable),
          );
        },
      ));
      if (!environment.isServer()) {
        loadQueryAstTimeoutId = setTimeout(() => {
          cancelOnLoadCallback();
          const onTimeout = options?.onQueryAstLoadTimeout;
          if (onTimeout) {
            onTimeout();
          }
          // complete() the subject so that the observer knows no (additional) payloads
          // will be delivered
          executionSubject.complete();
        }, LOAD_QUERY_AST_MAX_TIMEOUT);
      }
    }
  } else {
    const graphQlTaggedNode: GraphQLTaggedNode = (preloadableRequest: $FlowFixMe);
    const request = getRequest(graphQlTaggedNode);
    params = request.params;
    checkAvailabilityAndExecute(request);
  }

  let isDisposed = false;
  return {
    kind: 'PreloadedQuery',
    environment,
    environmentProviderOptions,
    dispose() {
      if (isDisposed) {
        return;
      }
      unsubscribeFromExecution && unsubscribeFromExecution();
      retainReference && retainReference.dispose();
      cancelOnLoadCallback && cancelOnLoadCallback();
      loadQueryAstTimeoutId != null && clearTimeout(loadQueryAstTimeoutId);
      isDisposed = true;
    },
    id: moduleId,
    // $FlowFixMe[unsafe-getters-setters] - this has no side effects
    get isDisposed() {
      return isDisposed;
    },
    name: params.name,
    networkCacheConfig,
    fetchPolicy,
    source: madeNetworkRequest ? returnedObservable : undefined,
    variables,
  };
}

module.exports = {loadQuery, useTrackLoadQueryInRender};
