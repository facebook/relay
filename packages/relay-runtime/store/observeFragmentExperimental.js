/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

import type {RequestDescriptor} from './RelayStoreTypes';
import type {
  Fragment,
  FragmentType,
  IEnvironment,
  SingularReaderSelector,
  Snapshot,
  Subscription,
} from 'relay-runtime';

const Observable = require('../network/RelayObservable');
const {getFragment} = require('../query/GraphQLTag');
const getPendingOperationsForFragment = require('../util/getPendingOperationsForFragment');
const {
  handlePotentialSnapshotErrors,
} = require('../util/handlePotentialSnapshotErrors');
const {getSelector} = require('./RelayModernSelector');
const invariant = require('invariant');

/**
 * Models the various states that a fragment can be in over time:
 * - 'ok': The fragment has a value
 * - 'error': The fragment has an error, this could be due to a network error or
 *   a field error due to @required(action: THROW) or @throwOnFieldError
 * - 'loading': The fragment is still in flight and is still expected to resolver.
 */
export type FragmentState<T> =
  | {state: 'ok', value: T}
  | {state: 'error', error: Error}
  | {state: 'loading'};

export type HasSpread<TFragmentType> = {
  +$fragmentSpreads: TFragmentType,
  ...
};

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correectly handle plural fragments or some
 * features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns a promise that resolves
 * once the fragment data is available, or rejects if the fragment has an error.
 * Errors include both network errors and field errors due to @required(action:
 * THROW) or @throwOnFieldError.

 * This API is intended for use when consuming data outside of a UI framework, or
 * when you need to imperatively access data inside an event handler. For example,
 * you might choose to @defer a fragment that you only need to access inside an
 * event handler and then await its value inside the handler if/when it is triggered.
 */
async function waitForFragmentData<TFragmentType: FragmentType, TData>(
  environment: IEnvironment,
  fragment: Fragment<TFragmentType, TData>,
  fragmentRef: HasSpread<TFragmentType>,
): Promise<TData> {
  let subscription: ?Subscription;

  try {
    const data = await new Promise<TData>((resolve, reject) => {
      subscription = observeFragment(
        environment,
        fragment,
        fragmentRef,
      ).subscribe({
        next: (val: FragmentState<TData>) => {
          if (val.state === 'ok') {
            resolve(val.value);
          } else if (val.state === 'error') {
            reject(val.error);
          }
        },
      });
    });
    subscription?.unsubscribe();
    return data;
  } catch (e: mixed) {
    subscription?.unsubscribe();
    throw e;
  }
}

declare function observeFragment<TFragmentType: FragmentType, TData>(
  environment: IEnvironment,
  fragment: Fragment<TFragmentType, TData>,
  fragmentRef: HasSpread<TFragmentType>,
): Observable<FragmentState<TData>>;

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correectly handle plural fragments or some
 * features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns an observable that emits
 * the state of the fragment over time. The observable will emit the following
 * values:
 * - 'ok': The fragment has a value
 * - 'error': The fragment has an error, this could be due to a network error or
 *  a field error due to @required(action: THROW) or @throwOnFieldError
 * - 'loading': The fragment is still in flight and is still expected to resolver.
 */
function observeFragment<TFragmentType: FragmentType, TData>(
  environment: IEnvironment,
  fragment: Fragment<TFragmentType, TData>,
  fragmentRef: mixed,
): Observable<FragmentState<TData>> {
  const fragmentNode = getFragment(fragment);
  const fragmentSelector = getSelector(fragmentNode, fragmentRef);
  invariant(
    fragmentNode.metadata?.hasClientEdges == null,
    "Client edges aren't supported yet.",
  );
  invariant(fragmentSelector != null, 'Expected a selector, got null.');
  switch (fragmentSelector.kind) {
    case 'SingularReaderSelector':
      return observeSelector(environment, fragment, fragmentSelector);
    case 'PluralReaderSelector': {
      // TODO: We could use something like this RXJS's combineLatest to create
      // an observable for each selector and merge them.
      // https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts
      //
      // Note that this problem is a bit tricky because Relay currently only
      // lets you subscribe at a singular fragment granularity. This makes it
      // hard to batch updates such that when a store update causes multiple
      // fragments to change, we can only publish a single update to the
      // fragment owner.
      invariant(false, 'Plural fragments are not supported');
    }
  }
  invariant(false, 'Unsupported fragment selector kind');
}

function observeSelector<TFragmentType: FragmentType, TData>(
  environment: IEnvironment,
  fragmentNode: Fragment<TFragmentType, TData>,
  fragmentSelector: SingularReaderSelector,
): Observable<FragmentState<TData>> {
  const snapshot = environment.lookup(fragmentSelector);

  return Observable.create<FragmentState<TData>>(sink => {
    sink.next(
      snapshotToFragmentState<TFragmentType, TData>(
        environment,
        fragmentNode,
        fragmentSelector.owner,
        snapshot,
      ),
    );

    const subscription = environment.subscribe(snapshot, nextSnapshot => {
      sink.next(
        snapshotToFragmentState<TFragmentType, TData>(
          environment,
          fragmentNode,
          fragmentSelector.owner,
          nextSnapshot,
        ),
      );
    });

    return () => subscription.dispose();
  });
}

function snapshotToFragmentState<TFragmentType: FragmentType, TData>(
  environment: IEnvironment,
  fragmentNode: Fragment<TFragmentType, TData>,
  owner: RequestDescriptor,
  snapshot: Snapshot,
): FragmentState<TData> {
  const missingLiveResolverFields =
    snapshot.missingLiveResolverFields != null &&
    snapshot.missingLiveResolverFields.length > 0;
  const missingClientEdges =
    snapshot.missingClientEdges != null &&
    snapshot.missingClientEdges.length > 0;
  /**
   * If any live resolvers are in a suspended state, we are in a loading state.
   */
  if (missingLiveResolverFields || missingClientEdges) {
    // Unlike in React where we need to throw a promise, here we can just return
    // a loading state and trust that our snapshot subscription will notify us
    // about all relevant state updates including the one where our live
    // resolver starts returnin a real value. This is a be less efficient than
    // directly getting a promise for the individual live resolver since we have to
    // reread on every intermediate state update, but it's technically more
    // correct since it's possible another update could cause us to stop reading this
    // live resolver.
    return {state: 'loading'};
  }

  if (snapshot.isMissingData) {
    const pendingOperations = getPendingOperationsForFragment(
      environment,
      fragmentNode,
      owner,
    );
    if (pendingOperations != null) {
      return {state: 'loading'};
    }
  }

  try {
    handlePotentialSnapshotErrors(environment, snapshot.errorResponseFields);
  } catch (error) {
    return {error, state: 'error'};
  }

  // Note: It's possible that we are missing data here but there are no requests
  // in flight to get that data. If that's the case, we return data as we have
  // it. Some fields will be `undefined` which will not match the types Relay's
  // compiler generated. This is a known type hole in Relay. To avoid this case
  // users can put `@throwOnFieldError` which changes the behavior to throw an
  // error instead of returning partial data.

  invariant(snapshot.data != null, 'Expected data to be non-null.');

  return {state: 'ok', value: (snapshot.data: $FlowFixMe)};
}

module.exports = {
  observeFragment,
  waitForFragmentData,
};
