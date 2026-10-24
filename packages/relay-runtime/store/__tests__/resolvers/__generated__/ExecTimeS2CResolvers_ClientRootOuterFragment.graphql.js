/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<411ceefd99c78080c8b10c472112b151>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ExecTimeS2CResolvers_ClientRootFragment$key } from "./ExecTimeS2CResolvers_ClientRootFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {exec_time_s2c_client_root as queryExecTimeS2cClientRootResolverType} from "../ExecTimeS2CResolvers.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryExecTimeS2cClientRootResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryExecTimeS2cClientRootResolverType as (
  rootKey: ExecTimeS2CResolvers_ClientRootFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type ExecTimeS2CResolvers_ClientRootOuterFragment$fragmentType: FragmentType;
export type ExecTimeS2CResolvers_ClientRootOuterFragment$data = {
  readonly exec_time_s2c_client_root: ?string,
  readonly $fragmentType: ExecTimeS2CResolvers_ClientRootOuterFragment$fragmentType,
};
export type ExecTimeS2CResolvers_ClientRootOuterFragment$key = {
  readonly $data?: ExecTimeS2CResolvers_ClientRootOuterFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CResolvers_ClientRootOuterFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CResolvers_ClientRootOuterFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ExecTimeS2CResolvers_ClientRootFragment"
      },
      "kind": "RelayResolver",
      "name": "exec_time_s2c_client_root",
      "resolverModule": require('../ExecTimeS2CResolvers').exec_time_s2c_client_root,
      "path": "exec_time_s2c_client_root"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5b454da914fc847c4b482eb14a7b3ca4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CResolvers_ClientRootOuterFragment$fragmentType,
  ExecTimeS2CResolvers_ClientRootOuterFragment$data,
>*/);
