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

'use strict';

import type {TestResolverContextType} from '../../../mutations/__tests__/TestResolverContextType';
import type {LiveState} from 'relay-runtime';

/**
 * @RelayResolver Query.counter_context: Int
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter_context(
  _args: void,
  context: TestResolverContextType,
): LiveState<number> {
  let value = 0;

  return {
    read() {
      return value;
    },
    subscribe(cb): () => void {
      const subscription = context.counter.subscribe({
        next: v => {
          value = v;
          cb();
        },
      });

      return () => subscription.unsubscribe();
    },
  };
}

/**
 * @RelayResolver BaseCounter
 * @weak
 */
export type BaseCounter = {
  count: number,
};

/**
 * @RelayResolver Query.base_counter_context: BaseCounter
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function base_counter_context(
  _args: void,
  context: TestResolverContextType,
): LiveState<BaseCounter> {
  let value = 0;

  return {
    read() {
      return {
        count: value,
      };
    },
    subscribe(cb): () => void {
      const subscription = context.counter.subscribe({
        next: v => {
          value = v;
          cb();
        },
      });

      return () => subscription.unsubscribe();
    },
  };
}

/**
 * @RelayResolver BaseCounter.count_plus_one: Int
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function count_plus_one(
  _parent: unknown,
  _args: void,
  context: TestResolverContextType,
): LiveState<number> {
  let value = 0;

  return {
    read() {
      return value;
    },
    subscribe(cb): () => void {
      const subscription = context.counter.subscribe({
        next: v => {
          value = v + 1;
          cb();
        },
      });

      return () => subscription.unsubscribe();
    },
  };
}

module.exports = {
  counter_context,
  base_counter_context,
  count_plus_one,
};
