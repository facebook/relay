/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {UserProfilePictureUriSuspendsWhenTheCounterIsOdd$key} from './__generated__/UserProfilePictureUriSuspendsWhenTheCounterIsOdd.graphql';
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {graphql} = require('relay-runtime');
const {
  suspenseSentinel,
} = require('relay-runtime/store/experimental-live-resolvers/LiveResolverSuspenseSentinel');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName user_profile_picture_uri_suspends_when_the_counter_is_odd
 * @rootFragment UserProfilePictureUriSuspendsWhenTheCounterIsOdd
 * @onType User
 * @live
 *
 * This field is returing the profile picture url, when s
 */
function UserProfilePictureUriSuspendsWhenTheCounterIsOdd(
  rootKey: UserProfilePictureUriSuspendsWhenTheCounterIsOdd$key,
): LiveState<?string> {
  const data = readFragment(
    graphql`
      fragment UserProfilePictureUriSuspendsWhenTheCounterIsOdd on User
      @argumentDefinitions(scale: {type: "Float"}) {
        greeting
        uri: user_profile_picture_uri_with_scale(scale: $scale)
      }
    `,
    rootKey,
  );
  return {
    read() {
      const number = Selectors.getNumber(GLOBAL_STORE.getState());
      if (number % 2 !== 0) {
        return `${String(data.greeting)} Picture Url: ${String(data.uri)}`;
      } else {
        return suspenseSentinel();
      }
    },
    subscribe(cb): () => void {
      // Here we could try to run the selector and short-circut if the value has
      // not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = UserProfilePictureUriSuspendsWhenTheCounterIsOdd;
