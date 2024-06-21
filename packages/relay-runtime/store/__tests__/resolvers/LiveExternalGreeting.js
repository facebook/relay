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

import type {LiveExternalGreetingFragment$key} from './__generated__/LiveExternalGreetingFragment.graphql';
import type {LiveState} from 'relay-runtime';

const {graphql, suspenseSentinel} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Query.live_external_greeting: String
 * @rootFragment LiveExternalGreetingFragment
 * @live
 */
function live_external_greeting(
  rootKey: LiveExternalGreetingFragment$key,
): LiveState<string> {
  const data = readFragment(
    graphql`
      fragment LiveExternalGreetingFragment on Query {
        user: live_user_suspends_when_odd @waterfall {
          name
        }
      }
    `,
    rootKey,
  );
  return {
    read() {
      if (data?.user?.name == null) {
        return suspenseSentinel();
      }
      return `${state.salutation} ${data.user.name}`;
    },
    subscribe,
  };
}

type State = {
  salutation: string,
  subscribers: Set<() => void>,
};

const state: State = {
  salutation: 'Welcome',
  subscribers: new Set(),
};

function subscribe(cb: () => void): () => void {
  state.subscribers.add(cb);
  return () => {
    state.subscribers.delete(cb);
  };
}

function updateSalutation(salutation: string) {
  state.salutation = salutation;
  state.subscribers.forEach(s => s());
}

live_external_greeting.__debug = {
  state,
  subscribe,
  updateSalutation,
};

module.exports = {
  live_external_greeting,
};
