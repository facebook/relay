/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<44228f7ea236c3c31d4c1edb876b1d17>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ClientEdgeToClientObjectTestClientRootFragment$key } from "./ClientEdgeToClientObjectTestClientRootFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {self as clientAccountSelfResolverType} from "../ClientEdgeToClientObject-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `clientAccountSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(clientAccountSelfResolverType: (
  rootKey: ClientEdgeToClientObjectTestClientRootFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?unknown);
declare export opaque type ClientEdgeToClientObjectTestClientRootNameFragment$fragmentType: FragmentType;
export type ClientEdgeToClientObjectTestClientRootNameFragment$data = {|
  +self: ?ReturnType<typeof clientAccountSelfResolverType>,
  +$fragmentType: ClientEdgeToClientObjectTestClientRootNameFragment$fragmentType,
|};
export type ClientEdgeToClientObjectTestClientRootNameFragment$key = {
  +$data?: ClientEdgeToClientObjectTestClientRootNameFragment$data,
  +$fragmentSpreads: ClientEdgeToClientObjectTestClientRootNameFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientEdgeToClientObjectTestClientRootNameFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ClientEdgeToClientObjectTestClientRootFragment"
      },
      "kind": "RelayResolver",
      "name": "self",
      "resolverModule": require('../ClientEdgeToClientObject-test').self,
      "path": "self"
    }
  ],
  "type": "ClientAccount",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "22c8af82f4599e2fe1b29ccf8da33b51";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ClientEdgeToClientObjectTestClientRootNameFragment$fragmentType,
  ClientEdgeToClientObjectTestClientRootNameFragment$data,
>*/);
