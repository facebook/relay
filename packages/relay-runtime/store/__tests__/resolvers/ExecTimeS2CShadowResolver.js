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

import type {ExecTimeS2CShadowResolver_RootFragment$key} from './__generated__/ExecTimeS2CShadowResolver_RootFragment.graphql';
import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * A Query-rooted "magic fragment" shadow resolver that is legal at exec time:
 * its root fragment navigates server records (`me.address`) but reads only
 * identity and the transplanted return fragment, so it is a server-to-client
 * resolver whose root fragment reaches linked records.
 *
 * @relayField Query.exec_time_s2c_shadow_address: IShadowMagicThing
 * @rootFragment ExecTimeS2CShadowResolver_RootFragment
 * @returnFragment ExecTimeS2CShadowResolver_ReturnFragment
 */
function exec_time_s2c_shadow_address(
  rootKey: ExecTimeS2CShadowResolver_RootFragment$key,
): ?{__typename: 'StreetAddress', __id: DataID} {
  const data = readFragment(
    graphql`
      fragment ExecTimeS2CShadowResolver_RootFragment on Query {
        me {
          address {
            __id
            ...ExecTimeS2CShadowResolver_ReturnFragment
          }
        }
      }
    `,
    rootKey,
  );
  const address = data.me?.address;
  if (address == null) {
    return null;
  }
  return {__typename: 'StreetAddress', __id: address.__id};
}

module.exports = {
  exec_time_s2c_shadow_address,
};
