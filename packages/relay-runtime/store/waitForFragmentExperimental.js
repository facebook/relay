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

import type {FragmentState, HasSpread} from './observeFragmentExperimental';
import type {
  Fragment,
  FragmentType,
  IEnvironment,
  Subscription,
} from 'relay-runtime';

const {observeFragment} = require('./observeFragmentExperimental');

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correctly handle some features of Relay Resolvers.
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
  fragmentRef:
    | HasSpread<TFragmentType>
    | $ReadOnlyArray<HasSpread<TFragmentType>>,
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

module.exports = {
  waitForFragmentData,
};
