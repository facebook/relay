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

import type {ShadowMagicThingResolver_RootFragment$key} from './__generated__/ShadowMagicThingResolver_RootFragment.graphql';
import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

// A per-`__typename` discriminated union over the magic-fragment return
// interface `IShadowMagicThing`. The two implementors need DIFFERENT runtime
// representations, so the arms differ:
//   - SERVER value type `StreetAddress`: an identity pointer `{__typename, __id}`
//     read in place off the transplanted record (its `__typename` maps to
//     `ServerWeak` in the artifact's `inlineKinds`, so the runtime routes it to
//     read-in-place).
//   - CLIENT `@weak` model `ShadowMagicWeakCity`: the FAT model value
//     `{__typename, __relay_model_instance}` (NOT a pointer) -- the weak-model
//     normalization stores `__relay_model_instance` as the record the model's
//     field resolvers read.
type ShadowMagicThingPointer =
  | {__typename: 'StreetAddress', __id: DataID}
  | {
      __typename: 'ShadowMagicWeakCity',
      __relay_model_instance: {city: string},
    };

/**
 * WEAK + server-VALUE "magic fragment" shadow resolver: ONE resolver, runtime
 * choice between two all-inline implementors of the same interface. The
 * `force_weak` field argument selects the arm so a consumer can request BOTH and
 * render them side by side, exercising the per-`__typename` dispatch
 * (`inlineKinds`): the SERVER `StreetAddress` arm is read in place off its
 * `__id`; the CLIENT weak arm is normalized + read off `__relay_model_instance`.
 *
 * @relayField Query.shadow_magic_thing(force_weak: Boolean): IShadowMagicThing
 * @rootFragment ShadowMagicThingResolver_RootFragment
 * @returnFragment ShadowMagicThingResolver_ReturnFragment
 */
function shadow_magic_thing(
  rootKey: ShadowMagicThingResolver_RootFragment$key,
  args: {force_weak: ?boolean},
): ?ShadowMagicThingPointer {
  const data = readFragment(
    graphql`
      fragment ShadowMagicThingResolver_RootFragment on Query {
        me {
          address {
            city
            ...ShadowMagicThingResolver_ReturnFragment
          }
        }
      }
    `,
    rootKey,
  );
  const address = data.me?.address;
  if (address == null || address.__id == null) {
    return null;
  }
  if (args.force_weak === true) {
    return {
      __typename: 'ShadowMagicWeakCity',
      __relay_model_instance: {city: `weak: ${address.city ?? '(none)'}`},
    };
  }
  return {__typename: 'StreetAddress', __id: address.__id};
}

module.exports = {
  shadow_magic_thing,
};
