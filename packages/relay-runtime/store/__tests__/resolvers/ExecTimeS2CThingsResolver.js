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

import type {ExecTimeS2CThingsResolver_LabelFragment$key} from './__generated__/ExecTimeS2CThingsResolver_LabelFragment.graphql';
import type {ExecTimeS2CThingsResolver_RootFragment$key} from './__generated__/ExecTimeS2CThingsResolver_RootFragment.graphql';
import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * A dispatcher in the production shape: its root fragment is a fetch
 * declaration over `nodes(ids:)`, bound from the field's own arguments.
 *
 * @relayField Query.exec_time_s2c_things: [IExecTimeS2CThing]
 * @rootFragment ExecTimeS2CThingsResolver_RootFragment
 * @returnFragment ExecTimeS2CThingsResolver_ReturnFragment
 */
function exec_time_s2c_things(
  rootKey: ExecTimeS2CThingsResolver_RootFragment$key,
  args: {ids: ReadonlyArray<string>},
): ReadonlyArray<{__typename: 'User', id: DataID}> {
  readFragment(
    graphql`
      fragment ExecTimeS2CThingsResolver_RootFragment on Query
      @argumentDefinitions(ids: {type: "[ID!]!"}) {
        nodes(ids: $ids) {
          ...ExecTimeS2CThingsResolver_ReturnFragment
        }
      }
    `,
    rootKey,
  );
  return args.ids.map(id => ({__typename: 'User', id}));
}

/**
 * A server-to-client resolver on a client interface that server types
 * implement.
 *
 * @relayField IExecTimeS2CThing.exec_time_s2c_thing_label: String
 * @rootFragment ExecTimeS2CThingsResolver_LabelFragment
 */
function exec_time_s2c_thing_label(
  rootKey: ExecTimeS2CThingsResolver_LabelFragment$key,
): string {
  const thing = readFragment(
    graphql`
      fragment ExecTimeS2CThingsResolver_LabelFragment on IExecTimeS2CThing {
        id
      }
    `,
    rootKey,
  );
  return `thing:${thing.id}`;
}

module.exports = {
  exec_time_s2c_thing_label,
  exec_time_s2c_things,
};
