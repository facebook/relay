/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<40461a8c40e3bb818657864990bb8bea>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ExecTimeS2CResolvers_IdentityFragment$key } from "./../resolvers/__generated__/ExecTimeS2CResolvers_IdentityFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {exec_time_s2c_identity as userExecTimeS2cIdentityResolverType} from "../resolvers/ExecTimeS2CResolvers.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userExecTimeS2cIdentityResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userExecTimeS2cIdentityResolverType as (
  rootKey: ExecTimeS2CResolvers_IdentityFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type DataCheckerExecTimeS2CTestDeferredFragment$fragmentType: FragmentType;
export type DataCheckerExecTimeS2CTestDeferredFragment$data = {
  readonly exec_time_s2c_identity: ?string,
  readonly $fragmentType: DataCheckerExecTimeS2CTestDeferredFragment$fragmentType,
};
export type DataCheckerExecTimeS2CTestDeferredFragment$key = {
  readonly $data?: DataCheckerExecTimeS2CTestDeferredFragment$data,
  readonly $fragmentSpreads: DataCheckerExecTimeS2CTestDeferredFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerExecTimeS2CTestDeferredFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ExecTimeS2CResolvers_IdentityFragment"
      },
      "kind": "RelayResolver",
      "name": "exec_time_s2c_identity",
      "resolverModule": require('../resolvers/ExecTimeS2CResolvers').exec_time_s2c_identity,
      "path": "exec_time_s2c_identity"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5ac8d4dced5841a61179cd1a4b93c550";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerExecTimeS2CTestDeferredFragment$fragmentType,
  DataCheckerExecTimeS2CTestDeferredFragment$data,
>*/);
