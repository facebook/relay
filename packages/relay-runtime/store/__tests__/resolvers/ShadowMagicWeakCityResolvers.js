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

// CLIENT `@weak` model implementor of the magic-fragment return interface
// `IShadowMagicThing`. A weak value has no id and no store record to refetch --
// its fields are read INLINE off the model instance. The same interface is also
// implemented by the non-Node SERVER VALUE type `StreetAddress` (read in place);
// see ShadowMagicFragment.graphql.
/**
 * @relayType ShadowMagicWeakCity implements IShadowMagicThing
 * @weak
 */
export type ShadowMagicWeakCity = {
  city: string,
};

/**
 * @relayField ShadowMagicWeakCity.city: String
 */
function city(model: ?ShadowMagicWeakCity): ?string {
  return model?.city;
}

module.exports = {
  city,
};
