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

import type {ExecTimeS2CNestedShadowResolver_RootFragment$key} from './__generated__/ExecTimeS2CNestedShadowResolver_RootFragment.graphql';
import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * A server-reading root fragment that also selects a resolver with a root
 * fragment of its own, which the normalizer collects while walking this one.
 *
 * @relayField Query.exec_time_s2c_shadow_nested: IShadowMagicThing
 * @rootFragment ExecTimeS2CNestedShadowResolver_RootFragment
 * @returnFragment ExecTimeS2CNestedShadowResolver_ReturnFragment
 */
function exec_time_s2c_shadow_nested(
  rootKey: ExecTimeS2CNestedShadowResolver_RootFragment$key,
): ?{__typename: 'StreetAddress', __id: DataID} {
  const data = readFragment(
    graphql`
      fragment ExecTimeS2CNestedShadowResolver_RootFragment on Query {
        me {
          client_nickname
          exec_time_s2c_keyed
          address {
            __id
            ...ExecTimeS2CNestedShadowResolver_ReturnFragment
          }
        }
        exec_time_s2c_client_root
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
  exec_time_s2c_shadow_nested,
};
