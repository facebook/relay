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

import type {ExecTimeS2CResolvers_ActorNameFragment$key} from './__generated__/ExecTimeS2CResolvers_ActorNameFragment.graphql';
import type {ExecTimeS2CResolvers_ClientRootFragment$key} from './__generated__/ExecTimeS2CResolvers_ClientRootFragment.graphql';
import type {ExecTimeS2CResolvers_ClientRootOuterFragment$key} from './__generated__/ExecTimeS2CResolvers_ClientRootOuterFragment.graphql';
import type {ExecTimeS2CResolvers_IdentityFragment$key} from './__generated__/ExecTimeS2CResolvers_IdentityFragment.graphql';
import type {ExecTimeS2CResolvers_KeyedFragment$key} from './__generated__/ExecTimeS2CResolvers_KeyedFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * A server-to-client resolver whose root fragment reads identity only.
 *
 * @relayField User.exec_time_s2c_identity: String
 * @rootFragment ExecTimeS2CResolvers_IdentityFragment
 */
function exec_time_s2c_identity(
  rootKey: ExecTimeS2CResolvers_IdentityFragment$key,
): string {
  const user = readFragment(
    graphql`
      fragment ExecTimeS2CResolvers_IdentityFragment on User {
        id
      }
    `,
    rootKey,
  );
  return `identity:${user.id}`;
}

/**
 * A server-to-client resolver whose root fragment also reads a field granted by
 * `@UNSTABLE_key` (see `schema-extensions/User.graphql`).
 *
 * @relayField User.exec_time_s2c_keyed: String
 * @rootFragment ExecTimeS2CResolvers_KeyedFragment
 */
function exec_time_s2c_keyed(
  rootKey: ExecTimeS2CResolvers_KeyedFragment$key,
): ?string {
  const user = readFragment(
    graphql`
      fragment ExecTimeS2CResolvers_KeyedFragment on User {
        id
        alternate_name
      }
    `,
    rootKey,
  );
  return user.alternate_name == null ? null : `keyed:${user.alternate_name}`;
}

/**
 * A Query-rooted resolver whose root fragment reads only client state, so the
 * normalizer collects it without walking its root fragment.
 *
 * @relayField Query.exec_time_s2c_client_root: String
 * @rootFragment ExecTimeS2CResolvers_ClientRootFragment
 */
function exec_time_s2c_client_root(
  rootKey: ExecTimeS2CResolvers_ClientRootFragment$key,
): ?string {
  const query = readFragment(
    graphql`
      fragment ExecTimeS2CResolvers_ClientRootFragment on Query {
        hello_optional_world
      }
    `,
    rootKey,
  );
  return query.hello_optional_world;
}

/**
 * A client-only root fragment that selects a resolver with a root fragment of
 * its own. The normalizer never walks this root fragment, so it never
 * collects the inner resolver.
 *
 * @relayField Query.exec_time_s2c_client_root_outer: String
 * @rootFragment ExecTimeS2CResolvers_ClientRootOuterFragment
 */
function exec_time_s2c_client_root_outer(
  rootKey: ExecTimeS2CResolvers_ClientRootOuterFragment$key,
): ?string {
  const query = readFragment(
    graphql`
      fragment ExecTimeS2CResolvers_ClientRootOuterFragment on Query {
        exec_time_s2c_client_root
      }
    `,
    rootKey,
  );
  return query.exec_time_s2c_client_root;
}

/**
 * A server-to-client resolver whose root fragment reads a key granted on an
 * interface, through an abstract refinement.
 *
 * @relayField User.exec_time_s2c_actor_name: String
 * @rootFragment ExecTimeS2CResolvers_ActorNameFragment
 */
function exec_time_s2c_actor_name(
  rootKey: ExecTimeS2CResolvers_ActorNameFragment$key,
): ?string {
  const user = readFragment(
    graphql`
      fragment ExecTimeS2CResolvers_ActorNameFragment on User {
        id
        ... on Actor {
          name
        }
      }
    `,
    rootKey,
  );
  return user.name == null ? null : `actor:${user.name}`;
}

module.exports = {
  exec_time_s2c_actor_name,
  exec_time_s2c_client_root,
  exec_time_s2c_client_root_outer,
  exec_time_s2c_identity,
  exec_time_s2c_keyed,
};
