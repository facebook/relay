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

import type {ShadowWeakDuoResolver_RootFragment$key} from './__generated__/ShadowWeakDuoResolver_RootFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

// A per-`__typename` discriminated union over the all-weak return interface
// `IShadowWeakDuo`. Both arms are `@weak` models read off `__relay_model_instance`;
// the `__typename` selects which implementor the runtime normalizes + reads. There
// is NO server-value arm (no `serverWeakTypes`), so this is the pure interface-weak
// case rather than the mixed weak+value case.
type ShadowWeakDuoPointer =
  | {
      __typename: 'ShadowWeakAlpha',
      __relay_model_instance: {label: string},
    }
  | {
      __typename: 'ShadowWeakBeta',
      __relay_model_instance: {label: string},
    };

/**
 * Pure interface-weak "magic fragment": ONE resolver, runtime choice between two
 * all-`@weak` implementors of the same interface. The `pick_beta` field argument
 * selects the arm so a consumer can request BOTH and render them side by side.
 *
 * @relayField Query.shadow_weak_duo(pick_beta: Boolean): IShadowWeakDuo
 * @rootFragment ShadowWeakDuoResolver_RootFragment
 * @returnFragment ShadowWeakDuoResolver_ReturnFragment
 */
function shadow_weak_duo(
  rootKey: ShadowWeakDuoResolver_RootFragment$key,
  args: {pick_beta: ?boolean},
): ?ShadowWeakDuoPointer {
  const data = readFragment(
    graphql`
      fragment ShadowWeakDuoResolver_RootFragment on Query {
        me {
          address {
            city
            ...ShadowWeakDuoResolver_ReturnFragment
          }
        }
      }
    `,
    rootKey,
  );
  const city = data.me?.address?.city ?? '(none)';
  if (args.pick_beta === true) {
    return {
      __typename: 'ShadowWeakBeta',
      __relay_model_instance: {label: `beta from ${city}`},
    };
  }
  return {
    __typename: 'ShadowWeakAlpha',
    __relay_model_instance: {label: `alpha from ${city}`},
  };
}

module.exports = {
  shadow_weak_duo,
};
